import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ContentTypeDefinitions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Content Type Definitions</CardTitle>
				<CardDescription>
					Understanding the four types of content used in this
					research
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4">
					<div className="border-l-4 border-green-600 pl-4 py-2">
						<p className="font-semibold text-gray-900">
							HR (Human-Written Real News)
						</p>
						<p className="text-sm text-gray-600">
							Authentic news articles written entirely by human
							journalists from established mainstream outlets
						</p>
					</div>
					<div className="border-l-4 border-blue-600 pl-4 py-2">
						<p className="font-semibold text-gray-900">
							AI-R (AI-Enhanced Real News)
						</p>
						<p className="text-sm text-gray-600">
							Factually accurate news rewritten and expanded by
							GPT-4 while preserving all original facts and claims
						</p>
					</div>
					<div className="border-l-4 border-orange-600 pl-4 py-2">
						<p className="font-semibold text-gray-900">
							HF (Human-Written Fake News)
						</p>
						<p className="text-sm text-gray-600">
							Fabricated misinformation created by human authors,
							collected from verified fake news sources
						</p>
					</div>
					<div className="border-l-4 border-red-600 pl-4 py-2">
						<p className="font-semibold text-gray-900">
							AI-F (AI-Generated Fake News)
						</p>
						<p className="text-sm text-gray-600">
							Fabricated misinformation produced by GPT-4 using
							prompts designed to mimic Filipino fake news
							characteristics
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
