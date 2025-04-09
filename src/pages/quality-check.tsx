import React from "react";
import QualityChecklist from "@/components/PreLaunchReview/QualityChecklist";
import AuthWrapper from "@/components/Auth/AuthWrapper";

const QualityCheckPage = () => {
  return (
    <AuthWrapper requiredPermission="canManageSettings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pre-Launch Quality Check
          </h1>
          <p className="text-muted-foreground">
            Comprehensive review of your application before deployment
          </p>
        </div>
        <QualityChecklist />
      </div>
    </AuthWrapper>
  );
};

export default QualityCheckPage;
