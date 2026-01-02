// components/FollowUp.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, Users, AlertCircle, Clock } from "lucide-react";
import { Prescription } from "@/types/prescription";

interface FollowUpProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function FollowUp({ prescription, onUpdateField }: FollowUpProps) {
  return (
    <div
      id="follow-up"
      className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors"
    >
      {/* Left Sidebar */}
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">Follow Up</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Treatment Monitoring & Review
            </div>
          </div>
        </div>

        {/* Follow Up Quick Stats */}
        <div className="mt-3 space-y-2">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-green-100 dark:border-green-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Clock className="h-3 w-3 text-green-500" />
              Follow-up Status
            </div>
            <div className="text-sm font-medium mt-1">
              {prescription.followUp ? "Instructions set" : "Not specified"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <Accordion type="multiple" className="w-full space-y-3">
          {/* Follow Up Details */}
          <AccordionItem
            value="follow-up-details"
            className="border border-green-100 dark:border-green-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900"
          >
            <AccordionTrigger className="py-3 hover:no-underline group">
              <div className="flex items-center gap-2 w-full">
                <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="text-left">
                  <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Follow Up Instructions
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Treatment monitoring and review schedule
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              {/* Follow Up Instructions */}
              <div>
                <Label
                  htmlFor="followUp"
                  className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-2"
                >
                  <Users className="h-3.5 w-3.5 text-green-600" />
                  Follow-up Instructions *
                </Label>
                <Textarea
                  id="followUp"
                  value={prescription.followUp || ""}
                  onChange={(e) => onUpdateField("followUp", e.target.value)}
                  className="mt-1.5 text-xs sm:text-sm min-h-[180px] bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 border-green-100 dark:border-green-800"
                  placeholder={`• Return for re-evaluation in [timeframe, e.g., 2 weeks, 1 month]
• Schedule follow-up appointment on [date if known]
• Monitor specific symptoms (fever, pain, swelling, etc.)
• Return immediately if symptoms worsen or new symptoms appear
• Complete prescribed treatment course before follow-up
• Bring all medications to next appointment
• Schedule necessary tests/labs before next visit
• Weight monitoring instructions if applicable
• Blood pressure/sugar monitoring if needed
• Activity restrictions and when to resume normal activities
• Warning signs to watch for`}
                  rows={6}
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="text-xs text-muted-foreground pl-1">
                    Specific instructions for follow-up visit, monitoring, and
                    when to return
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium ml-auto">
                    {prescription.followUp?.length || 0} characters
                  </div>
                </div>
              </div>

              {/* Example Templates */}
              <div className="mt-4">
                <Label className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  Quick Templates
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateField(
                        "followUp",
                        "Return for follow-up in 2 weeks to assess treatment response. Return immediately if symptoms worsen or fever develops."
                      )
                    }
                    className="text-xs p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors text-left"
                  >
                    Standard 2-week follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateField(
                        "followUp",
                        "Return in 1 month for routine check-up. Continue medications as prescribed. Monitor blood pressure twice weekly and keep a record."
                      )
                    }
                    className="text-xs p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-left"
                  >
                    Monthly chronic disease follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateField(
                        "followUp",
                        "Return after completing antibiotic course (7 days). Return immediately if no improvement in 3 days or if symptoms worsen."
                      )
                    }
                    className="text-xs p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-left"
                  >
                    Post-treatment follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateField(
                        "followUp",
                        "Return for wound check in 1 week. Keep wound clean and dry. Return immediately if signs of infection develop (redness, swelling, pus, fever)."
                      )
                    }
                    className="text-xs p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-left"
                  >
                    Wound check follow-up
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
