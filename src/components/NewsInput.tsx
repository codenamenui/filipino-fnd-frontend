"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import sampleArticles from "@/config/sampleArticles.json";
import type { SampleArticles } from "@/types";

type SampleKey = keyof SampleArticles;

interface NewsInputProps {
	inputText: string;
	setInputText: (value: string) => void;
	selectedModelsCount: number;
	isClassifying: boolean;
	onClassify: () => void;
}

export default function NewsInput({
	inputText,
	setInputText,
	selectedModelsCount,
	isClassifying,
	onClassify,
}: NewsInputProps) {
	const handleLoadSample = (type: SampleKey) => {
		setInputText(sampleArticles[type]);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Input News Article</CardTitle>
				<CardDescription>
					Enter a Filipino news article to classify
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<p className="text-sm font-medium mb-2">
							Load sample article:
						</p>
						<div className="flex flex-wrap gap-2">
							<Button
								onClick={() => handleLoadSample("HR")}
								variant="outline"
								size="sm">
								Human Real
							</Button>
							<Button
								onClick={() => handleLoadSample("AI-R")}
								variant="outline"
								size="sm">
								AI-Enhanced Real
							</Button>
							<Button
								onClick={() => handleLoadSample("HF")}
								variant="outline"
								size="sm">
								Human Fake
							</Button>
							<Button
								onClick={() => handleLoadSample("AI-F")}
								variant="outline"
								size="sm">
								AI-Generated Fake
							</Button>
						</div>
					</div>

					<Textarea
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder="Ilagay dito ang balita sa Filipino..."
						className="min-h-48 resize-none"
					/>

					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">
							{inputText.length} characters
						</span>
						<div className="space-x-2">
							<Button
								onClick={() => setInputText("")}
								variant="outline">
								Clear
							</Button>
							<Button
								onClick={onClassify}
								disabled={
									selectedModelsCount === 0 ||
									!inputText.trim() ||
									isClassifying
								}
								className="bg-green-600 hover:bg-green-700">
								{isClassifying ? (
									<span className="flex items-center">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Classifying...
									</span>
								) : (
									"Classify"
								)}
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
