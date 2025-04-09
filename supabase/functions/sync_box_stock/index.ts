import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get deliveries
    const { data: deliveries, error: deliveriesError } = await supabaseClient
      .from("deliveries")
      .select("*");

    if (deliveriesError) throw deliveriesError;

    // Get products for additional info
    const { data: products, error: productsError } = await supabaseClient
      .from("products")
      .select("*");

    if (productsError) throw productsError;

    // Get existing stock units to account for allocated pairs
    const { data: stockUnits, error: stockUnitsError } = await supabaseClient
      .from("stock_units")
      .select("*");

    if (stockUnitsError) throw stockUnitsError;

    // Calculate allocated pairs by SKU
    const allocatedPairsBySku: Record<string, number> = {};
    stockUnits.forEach((unit) => {
      const sku = unit.sku.toLowerCase();
      if (!allocatedPairsBySku[sku]) {
        allocatedPairsBySku[sku] = 0;
      }
      allocatedPairsBySku[sku] += unit.quantity;
    });

    // Group deliveries by SKU and calculate totals
    const stockBySku: Record<string, any> = {};
    deliveries.forEach((delivery) => {
      const sku = delivery.sku;
      if (!stockBySku[sku]) {
        const product = products.find((p) => p.sku === sku);
        stockBySku[sku] = {
          id: `box-${sku}`,
          sku: sku,
          name: delivery.product_name || product?.name || sku,
          category: product?.category || "unknown",
          box_count: 0,
          pairs_per_box: delivery.pairs_per_box,
          total_pairs: 0,
          stock_level: "low",
        };
      }

      stockBySku[sku].box_count += delivery.box_count;
      stockBySku[sku].total_pairs += delivery.total_pairs;
    });

    // Adjust box counts and total pairs based on allocated stock units
    Object.entries(stockBySku).forEach(([sku, item]) => {
      const lowerSku = sku.toLowerCase();
      const allocatedPairs = allocatedPairsBySku[lowerSku] || 0;

      if (allocatedPairs > 0 && item.pairs_per_box > 0) {
        // Calculate how many pairs should be subtracted from the total
        const pairsToSubtract = Math.min(allocatedPairs, item.total_pairs);

        // Calculate how many boxes that represents (round up to ensure we don't over-allocate)
        const boxesToReduce = Math.ceil(pairsToSubtract / item.pairs_per_box);

        // Ensure we don't reduce below zero
        item.box_count = Math.max(0, item.box_count - boxesToReduce);
        item.total_pairs = Math.max(0, item.total_pairs - pairsToSubtract);
      }
    });

    // Calculate stock levels
    const calculateStockLevel = (
      boxCount: number,
    ): "low" | "medium" | "high" => {
      if (boxCount <= 15) return "low";
      if (boxCount <= 30) return "medium";
      return "high";
    };

    // Convert to array and calculate stock levels
    const updatedStockItems = Object.values(stockBySku).map((item: any) => ({
      ...item,
      stock_level: calculateStockLevel(item.box_count),
    }));

    // Clear existing box_stock table
    const { error: deleteError } = await supabaseClient
      .from("box_stock")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

    if (deleteError) throw deleteError;

    // Insert updated stock items
    if (updatedStockItems.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("box_stock")
        .insert(updatedStockItems);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Box stock synchronized successfully",
        data: updatedStockItems,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
