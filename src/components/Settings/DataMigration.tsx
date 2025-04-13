import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Database,
  HardDrive,
} from "lucide-react";
import {
  migrateLocalStorageToSupabase,
  checkDataConsistency,
} from "@/lib/migration";
import { checkSupabaseConnection } from "@/services/supabase";

export default function DataMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success?: boolean;
    migrated?: string[];
    errors?: string[];
  }>({});

  const [isChecking, setIsChecking] = useState(false);
  const [consistencyResult, setConsistencyResult] = useState<{
    consistent?: boolean;
    inconsistencies?: string[];
  }>({});

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      // First check Supabase connection
      const connectionStatus = await checkSupabaseConnection();
      console.log("Connection check result:", connectionStatus);

      if (!connectionStatus.connected) {
        throw new Error(
          `Supabase connection issues: ${connectionStatus.details.error || "Unknown connection error"}`,
        );
      }

      // Then check data consistency
      const isConsistent = await checkDataConsistency();
      console.log("Data consistency check result:", isConsistent);

      if (!isConsistent.consistent) {
        console.warn(
          `Data consistency issues found: ${isConsistent.inconsistencies.join(", ")}`,
        );
        // Continue with migration despite inconsistencies, but log them
      }

      const result = await migrateLocalStorageToSupabase();
      setMigrationResult({
        success: result.success,
        migrated: result.migrated,
        errors: result.errors,
      });

      // Log the result for debugging
      console.log("Migration completed with result:", result);
    } catch (error) {
      console.error("Migration failed:", error);
      setMigrationResult({
        success: false,
        errors: [
          error instanceof Error
            ? error.message
            : "Unexpected error during migration",
        ],
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleConsistencyCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkDataConsistency();
      setConsistencyResult(result);
    } catch (error) {
      console.error("Consistency check failed:", error);
      setConsistencyResult({
        consistent: false,
        inconsistencies: ["Unexpected error during consistency check"],
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration Utility
          </CardTitle>
          <CardDescription>
            Migrate data from local storage to Supabase to ensure a single
            source of truth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4 p-4">
            <div className="text-center">
              <HardDrive className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Local Storage</p>
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="font-medium">Supabase</p>
            </div>
          </div>

          {migrationResult.success !== undefined && (
            <Alert
              variant={migrationResult.success ? "default" : "destructive"}
            >
              <div className="flex items-start gap-2">
                {migrationResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <div>
                  <AlertTitle>
                    {migrationResult.success
                      ? "Migration Successful"
                      : "Migration Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {migrationResult.success ? (
                      <div className="mt-2">
                        <p>Successfully migrated the following data:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {migrationResult.migrated?.map((item) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p>Failed to migrate the following data:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {migrationResult.errors?.map((error) => (
                            <Badge key={error} variant="outline">
                              {error}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {consistencyResult.consistent !== undefined && (
            <Alert
              variant={consistencyResult.consistent ? "default" : "destructive"}
            >
              <div className="flex items-start gap-2">
                {consistencyResult.consistent ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <div>
                  <AlertTitle>
                    {consistencyResult.consistent
                      ? "Data Consistency Check Passed"
                      : "Data Inconsistencies Found"}
                  </AlertTitle>
                  <AlertDescription>
                    {consistencyResult.consistent ? (
                      <p>
                        All data is consistent between local storage and
                        Supabase.
                      </p>
                    ) : (
                      <div className="mt-2">
                        <p>The following inconsistencies were found:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {consistencyResult.inconsistencies?.map(
                            (item, index) => <li key={index}>{item}</li>,
                          )}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleConsistencyCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <span className="mr-2">Checking...</span>
                <Progress value={75} className="w-16" />
              </>
            ) : (
              "Check Data Consistency"
            )}
          </Button>
          <Button onClick={handleMigration} disabled={isMigrating}>
            {isMigrating ? (
              <>
                <span className="mr-2">Migrating...</span>
                <Progress value={75} className="w-16" />
              </>
            ) : (
              "Migrate to Supabase"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
