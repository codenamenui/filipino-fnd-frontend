import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import PerformanceChart from "@/components/PerformanceChart";
import SubclassChart from "@/components/SubclassChart";

export default function StudyResults() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>
						Performance Across Training Configurations
					</CardTitle>
					<CardDescription>
						Accuracy trends across three AI-adoption conditions (A:
						Human-Only, B: Moderate [67:33], C: Balanced [50:50])
						and five HF:AI-F ratios (100:0 to 0:100)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PerformanceChart />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Subclass-Wise Accuracy</CardTitle>
					<CardDescription>
						Performance breakdown for HR, AI-R, HF, and AI-F content
						types
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SubclassChart />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Key Findings Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="border-2 rounded-lg p-6 text-center hover:border-green-600 transition-colors">
							<div className="text-3xl font-bold text-green-600 mb-2">
								30
							</div>
							<div className="text-sm font-medium text-gray-900">
								Models Trained
							</div>
							<div className="text-xs text-gray-600 mt-1">
								2 architectures × 3 conditions × 5 ratios
							</div>
						</div>
						<div className="border-2 rounded-lg p-6 text-center hover:border-green-600 transition-colors">
							<div className="text-3xl font-bold text-green-600 mb-2">
								4,332
							</div>
							<div className="text-sm font-medium text-gray-900">
								Total Dataset Size
							</div>
							<div className="text-xs text-gray-600 mt-1">
								2,166 human + 2,166 AI-generated articles
							</div>
						</div>
						<div className="border-2 rounded-lg p-6 text-center hover:border-green-600 transition-colors">
							<div className="text-3xl font-bold text-green-600 mb-2">
								4
							</div>
							<div className="text-sm font-medium text-gray-900">
								Content Types
							</div>
							<div className="text-xs text-gray-600 mt-1">
								HR, AI-R, HF, AI-F
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
