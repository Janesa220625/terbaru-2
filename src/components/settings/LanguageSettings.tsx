import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Languages, Check, Save } from "lucide-react";

interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LanguageSettings = () => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  const languages: Language[] = [
    {
      id: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
    },
    {
      id: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      flag: "🇮🇩",
    },
  ];

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSaveChanges = () => {
    setDefaultLanguage(selectedLanguage);
    toast({
      title: "Success",
      description: "Language settings saved successfully.",
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Language Settings</CardTitle>
            <CardDescription>
              Configure the language for the application interface
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4" />
            <span>
              Current: {languages.find((l) => l.id === defaultLanguage)?.name}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Select Language</h3>
            <RadioGroup
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
              className="space-y-3"
            >
              {languages.map((language) => (
                <div
                  key={language.id}
                  className={`flex items-center space-x-2 border rounded-md p-4 ${selectedLanguage === language.id ? "border-primary bg-primary/5" : "border-input"}`}
                >
                  <RadioGroupItem
                    value={language.id}
                    id={`language-${language.id}`}
                  />
                  <Label
                    htmlFor={`language-${language.id}`}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <span className="text-xl">{language.flag}</span>
                    <div>
                      <div className="font-medium">{language.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {language.nativeName}
                      </div>
                    </div>
                    {selectedLanguage === language.id &&
                      defaultLanguage === language.id && (
                        <span className="ml-auto text-primary">
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="bg-muted/50 rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Language Information</h3>
            <p className="text-sm text-muted-foreground">
              Changing the language will affect all text in the application
              interface. User data and reports will not be affected.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button
          className="flex items-center gap-2 ml-auto"
          onClick={handleSaveChanges}
          disabled={selectedLanguage === defaultLanguage}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LanguageSettings;
