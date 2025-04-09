import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  Info,
  Package,
  PackageOpen,
  Ruler,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

const TestingGuide = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Testing Guide</h2>
        <p className="text-muted-foreground">
          Comprehensive guide for testing the Warehouse Box & Unit Management
          System
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Welcome to the Testing Program
              </h3>
              <p className="text-blue-700">
                Thank you for participating in our testing program. This guide
                will help you navigate through the application and test its
                various features. Your feedback is invaluable to us in improving
                the system.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-300"
                >
                  Version: 1.0.0-beta
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-300"
                >
                  Testing Period: 14 days
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="test-scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="features">Feature Testing</TabsTrigger>
          <TabsTrigger value="feedback">Providing Feedback</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Setup
              </CardTitle>
              <CardDescription>
                Steps to set up your testing account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Creating Your Test Account
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Navigate to the{" "}
                    <Link
                      to="/test-registration"
                      className="text-primary hover:underline"
                    >
                      Test Registration
                    </Link>{" "}
                    page
                  </li>
                  <li>Enter your email address</li>
                  <li>
                    Select a role (for testing purposes, you can create multiple
                    accounts with different roles):
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>
                        <span className="font-medium">Admin</span>: Full access
                        to all features
                      </li>
                      <li>
                        <span className="font-medium">Manager</span>: Access to
                        management features
                      </li>
                      <li>
                        <span className="font-medium">Warehouse Manager</span>:
                        Focused on inventory operations
                      </li>
                      <li>
                        <span className="font-medium">Staff</span>: Basic
                        operational access
                      </li>
                      <li>
                        <span className="font-medium">Viewer</span>: Read-only
                        access
                      </li>
                    </ul>
                  </li>
                  <li>Optionally enter your first and last name</li>
                  <li>
                    The default password is <code>password123</code> (for
                    testing purposes only)
                  </li>
                  <li>Click "Create Test Account"</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Logging In</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Navigate to the{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Login
                    </Link>{" "}
                    page
                  </li>
                  <li>Enter your registered email address</li>
                  <li>
                    Enter the password (<code>password123</code>)
                  </li>
                  <li>Click "Sign In"</li>
                </ol>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="flex items-center gap-2 text-amber-800">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Important Note:</span> This is a
                  testing environment. All data entered during testing will be
                  reset at the end of the testing period.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Navigation Overview
              </CardTitle>
              <CardDescription>
                Understanding the application layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Main Navigation</h3>
                <p>
                  The application has the following main sections accessible
                  from the top navigation bar:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Dashboard</span>: Overview of
                    inventory metrics and recent activity
                  </li>
                  <li>
                    <span className="font-medium">Products</span>: Manage
                    product catalog and SKUs
                  </li>
                  <li>
                    <span className="font-medium">Inventory</span>: Access
                    inventory management modules
                  </li>
                  <li>
                    <span className="font-medium">Reports</span>: Generate and
                    view inventory reports
                  </li>
                  <li>
                    <span className="font-medium">Settings</span>: Configure
                    application settings
                  </li>
                  <li>
                    <span className="font-medium">Pre-Launch Review</span>:
                    Checklists for application readiness
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Inventory Modules</h3>
                <p>
                  The Inventory section contains several modules for different
                  aspects of inventory management:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Incoming Box Stock</span>:
                    Record new box deliveries
                  </li>
                  <li>
                    <span className="font-medium">Stock Opname</span>: Verify
                    physical inventory counts
                  </li>
                  <li>
                    <span className="font-medium">Outgoing Stock</span>: Record
                    unit sales and shipments
                  </li>
                  <li>
                    <span className="font-medium">Box Stock</span>: View current
                    box inventory levels
                  </li>
                  <li>
                    <span className="font-medium">Stock Units</span>: Manage
                    unit inventory by size and color
                  </li>
                  <li>
                    <span className="font-medium">Single Warehouse Stock</span>:
                    View unit inventory by SKU, color and size
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Scenarios Tab */}
        <TabsContent value="test-scenarios" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Test Scenarios
              </CardTitle>
              <CardDescription>
                Guided scenarios to test the application workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="scenario-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Scenario 1
                      </Badge>
                      <span>Complete Inventory Cycle</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>
                      This scenario tests the complete inventory cycle from
                      receiving boxes to shipping units.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-medium">Step 1: Add a New Product</h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to the Products section</li>
                        <li>Click "Add New Product"</li>
                        <li>
                          Fill in the product details (e.g., SKU:
                          "SKU-TEST-BLK", Name: "Test Shoes", Category: "Men's
                          Shoes")
                        </li>
                        <li>
                          Specify box content (e.g., 6 pairs per box, available
                          sizes: 40-45, colors: Black, Brown)
                        </li>
                        <li>Save the product</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 2: Record Incoming Box Stock
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Inventory → Incoming Box Stock</li>
                        <li>Click "New Delivery"</li>
                        <li>
                          Enter delivery details (e.g., Supplier: "Test
                          Supplier", Date: today)
                        </li>
                        <li>
                          Add the product you created (SKU-TEST-BLK) with 5
                          boxes
                        </li>
                        <li>Submit the delivery</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 3: Verify Box Stock and Unit Stock
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Inventory → Box Stock</li>
                        <li>
                          Verify that your product shows 5 boxes in inventory
                        </li>
                        <li>Navigate to Inventory → Stock Units</li>
                        <li>
                          Verify that the system has calculated the correct
                          number of units (5 boxes × 6 pairs = 30 pairs)
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 4: Record Outgoing Stock
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Inventory → Outgoing Stock</li>
                        <li>Click "New Delivery"</li>
                        <li>
                          Enter recipient details (e.g., Recipient: "Test
                          Customer")
                        </li>
                        <li>
                          Add your product (SKU-TEST-BLK) with 10 pairs of a
                          specific size and color
                        </li>
                        <li>Submit the delivery</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 5: Verify Updated Inventory
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Inventory → Stock Units</li>
                        <li>
                          Verify that the stock has been reduced by 10 pairs (30
                          - 10 = 20 pairs remaining)
                        </li>
                        <li>Navigate to Inventory → Box Stock</li>
                        <li>
                          Verify that the box count has been updated accordingly
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 6: Perform Stock Opname
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Inventory → Stock Opname</li>
                        <li>Click "New Stock Opname"</li>
                        <li>
                          Select your product and enter the actual physical
                          count (e.g., 18 pairs instead of 20 to simulate a
                          discrepancy)
                        </li>
                        <li>Submit the stock opname</li>
                        <li>
                          Verify that the system highlights the discrepancy and
                          allows you to adjust the inventory
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-md mt-4">
                      <p className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">
                          Expected Outcome:
                        </span>{" "}
                        The system should accurately track the inventory through
                        the entire cycle, from receiving boxes to shipping
                        units, and allow for inventory adjustments through stock
                        opname.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scenario-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Scenario 2
                      </Badge>
                      <span>Inventory Reporting and Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>
                      This scenario tests the reporting and analysis
                      capabilities of the system.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 1: Generate Inventory Reports
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to the Reports section</li>
                        <li>Select "Inventory Summary Report"</li>
                        <li>Set the date range to cover your test period</li>
                        <li>Generate the report</li>
                        <li>
                          Verify that the report includes the products you've
                          added and their current inventory levels
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 2: Analyze Inventory Trends
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to the Dashboard</li>
                        <li>Review the "Inventory Trends" chart</li>
                        <li>
                          Verify that the chart reflects the inventory changes
                          you've made
                        </li>
                        <li>
                          Test the filtering options to view trends for specific
                          products or categories
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Step 3: Export Reports</h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to the Reports section</li>
                        <li>Generate a report of your choice</li>
                        <li>Click the "Export" button</li>
                        <li>
                          Verify that the report is exported in the correct
                          format (e.g., Excel, PDF)
                        </li>
                        <li>
                          Open the exported file and check that all data is
                          correctly included
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-md mt-4">
                      <p className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">
                          Expected Outcome:
                        </span>{" "}
                        The system should provide accurate and comprehensive
                        reporting capabilities, allowing you to analyze
                        inventory trends and export reports in various formats.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scenario-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Scenario 3
                      </Badge>
                      <span>User Role Permissions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>
                      This scenario tests the different permission levels for
                      various user roles.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 1: Create Test Accounts with Different Roles
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>
                          Create test accounts with the following roles:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Admin</li>
                            <li>Manager</li>
                            <li>Warehouse Manager</li>
                            <li>Staff</li>
                            <li>Viewer</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 2: Test Admin Role Permissions
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Log in with the Admin account</li>
                        <li>
                          Verify access to all sections of the application
                        </li>
                        <li>
                          Test the ability to add, edit, and delete products
                        </li>
                        <li>
                          Test the ability to manage user accounts in the
                          Settings section
                        </li>
                        <li>
                          Verify access to all reports and system configuration
                          options
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 3: Test Viewer Role Permissions
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Log in with the Viewer account</li>
                        <li>Verify read-only access to the application</li>
                        <li>
                          Attempt to add, edit, or delete products (should be
                          restricted)
                        </li>
                        <li>
                          Attempt to record inventory transactions (should be
                          restricted)
                        </li>
                        <li>
                          Verify ability to view reports but not modify system
                          settings
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Step 4: Test Other Role Permissions
                      </h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>
                          Log in with each of the remaining roles (Manager,
                          Warehouse Manager, Staff)
                        </li>
                        <li>
                          For each role, test the expected permissions based on
                          the role description
                        </li>
                        <li>
                          Verify that appropriate restrictions are in place for
                          each role
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-md mt-4">
                      <p className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">
                          Expected Outcome:
                        </span>{" "}
                        The system should enforce appropriate permissions for
                        each user role, restricting access to features based on
                        the user's assigned role.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Testing Tab */}
        <TabsContent value="features" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Core Features Testing
              </CardTitle>
              <CardDescription>
                Detailed testing instructions for each feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="feature-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span>Product Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Test Cases:</h4>
                      <ol className="list-decimal pl-5 space-y-3">
                        <li>
                          <span className="font-medium">
                            Add a new product:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Navigate to Products and click "Add New Product"
                            </li>
                            <li>
                              Fill in all required fields (SKU, name, category,
                              etc.)
                            </li>
                            <li>
                              Specify box content details (pairs per box, sizes,
                              colors)
                            </li>
                            <li>Save the product</li>
                            <li>
                              Verify the product appears in the product list
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">Edit a product:</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Select an existing product and click "Edit"</li>
                            <li>Modify some of the product details</li>
                            <li>Save the changes</li>
                            <li>
                              Verify the changes are reflected in the product
                              list
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test validation rules:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Try to create a product with a duplicate SKU
                              (should be prevented)
                            </li>
                            <li>
                              Try to create a product with missing required
                              fields (should show validation errors)
                            </li>
                            <li>
                              Try to enter invalid values (e.g., negative
                              numbers for pairs per box)
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test product search and filtering:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Use the search function to find specific products
                            </li>
                            <li>
                              Test filtering by category, size range, or other
                              attributes
                            </li>
                            <li>
                              Verify search results are accurate and relevant
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="flex items-center gap-2 text-amber-800">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Testing Focus:</span> Pay
                        special attention to the box content specifications and
                        how they affect inventory calculations. Verify that
                        changes to product details properly update throughout
                        the system.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="feature-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <PackageOpen className="h-4 w-4 text-primary" />
                      <span>Incoming Box Stock</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Test Cases:</h4>
                      <ol className="list-decimal pl-5 space-y-3">
                        <li>
                          <span className="font-medium">
                            Record a new box delivery:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Navigate to Inventory → Incoming Box Stock</li>
                            <li>Click "New Delivery"</li>
                            <li>
                              Enter delivery details (supplier, date, reference
                              number)
                            </li>
                            <li>
                              Add multiple products with different box
                              quantities
                            </li>
                            <li>Submit the delivery</li>
                            <li>
                              Verify the delivery appears in the delivery list
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test automatic unit calculation:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Record a delivery for a product with known box
                              content (e.g., 6 pairs per box)
                            </li>
                            <li>
                              Navigate to Stock Units and verify that the system
                              has correctly calculated the number of units
                              (boxes × pairs per box)
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test delivery document generation:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              After recording a delivery, view the delivery
                              details
                            </li>
                            <li>Test the "Print Document" function</li>
                            <li>
                              Verify that the generated document includes all
                              relevant delivery information
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test mass upload functionality:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Download the Excel template for mass upload</li>
                            <li>Fill in the template with delivery data</li>
                            <li>Upload the completed template</li>
                            <li>
                              Verify that the system correctly processes the
                              uploaded data
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="flex items-center gap-2 text-amber-800">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Testing Focus:</span> Pay
                        special attention to the accuracy of inventory updates
                        after recording deliveries. Verify that box quantities
                        and unit quantities are correctly synchronized.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="feature-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      <span>Stock Units Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Test Cases:</h4>
                      <ol className="list-decimal pl-5 space-y-3">
                        <li>
                          <span className="font-medium">
                            View stock units by product:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Navigate to Inventory → Stock Units</li>
                            <li>
                              Use the search or filter function to find a
                              specific product
                            </li>
                            <li>
                              Verify that the system displays the correct unit
                              quantities by size and color
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Manually adjust stock units:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Select a product and click "Adjust Stock"</li>
                            <li>
                              Enter a new quantity for a specific size and color
                            </li>
                            <li>Save the adjustment</li>
                            <li>
                              Verify that the stock is updated and an adjustment
                              record is created
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test low stock alerts:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Adjust a product's stock to fall below the low
                              stock threshold
                            </li>
                            <li>
                              Navigate to the Dashboard and verify that the
                              product appears in the low stock alerts
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test stock unit export:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              In the Stock Units view, click the "Export" button
                            </li>
                            <li>
                              Verify that the exported file contains accurate
                              stock information
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="flex items-center gap-2 text-amber-800">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Testing Focus:</span> Pay
                        special attention to how manual adjustments affect the
                        relationship between box stock and unit stock. Verify
                        that the system maintains consistency between these two
                        inventory views.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="feature-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>User Management and Security</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Test Cases:</h4>
                      <ol className="list-decimal pl-5 space-y-3">
                        <li>
                          <span className="font-medium">
                            Test user management:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Navigate to Settings → User Management (requires
                              admin access)
                            </li>
                            <li>Create a new user account</li>
                            <li>Edit an existing user's details</li>
                            <li>
                              Change a user's role and verify permission changes
                            </li>
                            <li>
                              Deactivate a user account and verify they can no
                              longer log in
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test role management:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Navigate to Settings → Role Management (requires
                              admin access)
                            </li>
                            <li>Review the permissions for each role</li>
                            <li>
                              Modify permissions for a role (if supported)
                            </li>
                            <li>
                              Verify that users with that role have updated
                              permissions
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test authentication security:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Test password requirements (if applicable)</li>
                            <li>
                              Test account lockout after multiple failed login
                              attempts (if implemented)
                            </li>
                            <li>
                              Test session timeout (log in, remain inactive, and
                              verify you're logged out after the timeout period)
                            </li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-medium">
                            Test access control:
                          </span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Log in with different user roles and verify
                              appropriate access restrictions
                            </li>
                            <li>
                              Attempt to access restricted URLs directly (should
                              be redirected or denied)
                            </li>
                            <li>
                              Verify that sensitive operations require
                              appropriate permissions
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="flex items-center gap-2 text-amber-800">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Testing Focus:</span> Pay
                        special attention to permission boundaries between
                        different roles. Verify that users cannot access
                        features or perform actions beyond their assigned
                        permissions.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providing Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Providing Feedback
              </CardTitle>
              <CardDescription>
                Guidelines for submitting effective feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Feedback Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border rounded-md">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Usability Feedback
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Comments on how easy or difficult it is to use the
                      application, including navigation, workflow, and user
                      interface design.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border rounded-md">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Functionality Feedback
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Comments on whether features work as expected, including
                      any bugs or unexpected behavior you encounter.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border rounded-md">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Performance Feedback
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Comments on the speed and responsiveness of the
                      application, including any slow-loading pages or
                      operations.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border rounded-md">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Feature Suggestions
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Ideas for new features or improvements to existing
                      features that would make the application more useful for
                      your needs.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">How to Submit Feedback</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">
                      In-App Feedback Form
                    </h4>
                    <p className="text-sm text-blue-700 mb-4">
                      The most direct way to provide feedback is through the
                      in-app feedback form:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                      <li>
                        Click on the "Feedback" button in the bottom right
                        corner of any page
                      </li>
                      <li>Select the feedback category</li>
                      <li>Provide a detailed description of your feedback</li>
                      <li>
                        Include screenshots if relevant (use the "Attach
                        Screenshot" button)
                      </li>
                      <li>Submit the form</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-md">
                    <h4 className="font-medium mb-2">Email Feedback</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      You can also send feedback via email to:
                    </p>
                    <p className="font-medium">
                      testing@warehouseapp.example.com
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-md">
                    <h4 className="font-medium mb-2">
                      Weekly Feedback Sessions
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      We will be conducting weekly feedback sessions via video
                      conference. You will receive calendar invitations for
                      these sessions. Please come prepared to discuss your
                      experience with the application.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Effective Feedback Tips</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    To help us make the most of your feedback, please consider
                    these tips:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">Be specific:</span> Instead
                      of "The inventory page is confusing," try "I found it
                      difficult to locate the 'Adjust Stock' button on the
                      inventory page."
                    </li>
                    <li>
                      <span className="font-medium">Provide context:</span>{" "}
                      Describe what you were trying to accomplish when you
                      encountered an issue.
                    </li>
                    <li>
                      <span className="font-medium">
                        Include steps to reproduce:
                      </span>{" "}
                      For bugs or issues, list the exact steps to reproduce the
                      problem.
                    </li>
                    <li>
                      <span className="font-medium">Suggest solutions:</span> If
                      you have ideas for how to improve something, we'd love to
                      hear them.
                    </li>
                    <li>
                      <span className="font-medium">
                        Prioritize your feedback:
                      </span>{" "}
                      Let us know which issues are most important to address
                      from your perspective.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">
                    Your feedback is valuable!
                  </span>{" "}
                  Every piece of feedback helps us improve the application. We
                  review all feedback and prioritize improvements based on user
                  needs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Common questions and answers about the testing process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>
                    How long will the testing period last?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      The testing period is scheduled to last for 14 days.
                      During this time, we encourage you to explore all aspects
                      of the application and provide as much feedback as
                      possible. If the testing period is extended, we will
                      notify all testers via email.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>
                    Is the test data real or fictional?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      All data in the testing environment is fictional and
                      created specifically for testing purposes. You can freely
                      add, modify, or delete data without affecting any real
                      inventory. The test environment is isolated from any
                      production systems.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>
                    What should I do if I encounter a bug?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      If you encounter a bug or unexpected behavior, please
                      report it through the in-app feedback form or via email.
                      When reporting a bug, please include:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>A clear description of the issue</li>
                      <li>Steps to reproduce the bug</li>
                      <li>What you expected to happen</li>
                      <li>What actually happened</li>
                      <li>Screenshots or screen recordings (if possible)</li>
                      <li>Your browser and device information (if relevant)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>
                    Can I invite others to test the application?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      The testing program is currently limited to invited
                      testers. If you would like to suggest additional testers,
                      please contact the testing coordinator with their name and
                      email address. We may expand the testing group based on
                      capacity and testing needs.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger>
                    Will my feedback be implemented?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      We value all feedback and carefully consider each
                      suggestion. While we cannot guarantee that every piece of
                      feedback will be implemented, your input directly
                      influences our development priorities. We will provide
                      regular updates on how feedback is being incorporated into
                      the application.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6">
                  <AccordionTrigger>
                    What happens after the testing period ends?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      After the testing period ends, we will compile all
                      feedback and prioritize improvements for the next version
                      of the application. Testers will receive a summary of the
                      testing results and our planned next steps. Depending on
                      the feedback, we may conduct additional testing rounds
                      before the final release.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-7">
                  <AccordionTrigger>
                    How can I reset my password if I forget it?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      For the testing environment, if you forget your password,
                      please contact the testing coordinator at
                      testing@warehouseapp.example.com. For security reasons, we
                      do not have an automated password reset function in the
                      testing environment. Remember that the default test
                      password is <code>password123</code>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-8">
                  <AccordionTrigger>
                    Are there any known issues I should be aware of?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Yes, there are a few known issues in the current testing
                      version:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        The export to PDF function may not format tables
                        correctly in some browsers
                      </li>
                      <li>
                        The dashboard charts may not display correctly on mobile
                        devices with small screens
                      </li>
                      <li>
                        Very large inventory imports (over 1000 items) may
                        experience performance issues
                      </li>
                      <li>
                        The system currently has limited support for non-English
                        characters in product names
                      </li>
                    </ul>
                    <p className="mt-2">
                      We are actively working on these issues, but you do not
                      need to report them unless you have specific additional
                      information that might help us resolve them.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-8">
            <Button className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingGuide;
