"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, XCircle } from "lucide-react";
import NewsInput from "@/components/NewsInput";
import ModelSelector from "@/components/ModelSelector";
import ContentTypeDefinitions from "@/components/ContentTypeDefinitions";
import ClassificationResults from "@/components/ClassificationResults";
import StudyResults from "@/components/StudyResults";
import AboutSection from "@/components/AboutSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ResultItem } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HomePage() {
	const [inputText, setInputText] = useState("");
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	const [isClassifying, setIsClassifying] = useState(false);
	const [results, setResults] = useState<ResultItem[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [metricsData, setMetricsData] = useState<
		Record<string, { accuracy: string; f1Score: string }>
	>({});

	useEffect(() => {
		fetch("/metrics.json")
			.then((res) => res.json())
			.then((data) => setMetricsData(data))
			.catch((err) => console.error("Failed to load metrics:", err));
	}, []);

	const handleClassify = async () => {
		if (selectedModels.length === 0 || !inputText.trim()) return;

		setIsClassifying(true);
		setError(null); // clear previous error
		setResults(null); // clear previous results

		try {
			const response = await fetch(`${API_BASE}/classify`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: inputText.trim(),
					model_ids: selectedModels,
				}),
			});

			if (!response.ok) {
				// Try to extract a more detailed error message from the backend
				let detail = `Server error (status ${response.status})`;
				try {
					const errData = await response.json();
					if (errData.detail) detail = errData.detail;
				} catch {}
				throw new Error(detail);
			}

			const data = await response.json();

			if (data.results) {
				const enriched: ResultItem[] = data.results.map((r: any) => {
					const m = metricsData[r.model_id] ?? {
						accuracy: "N/A",
						f1Score: "N/A",
					};
					return {
						...r,
						model: {
							architecture: r.architecture,
							condition: r.condition,
							ratio: r.ratio,
							accuracy: m.accuracy,
							f1Score: m.f1Score,
						},
					};
				});
				setResults(enriched);
			} else {
				throw new Error("No results returned from the server.");
			}
		} catch (err: any) {
			setError(
				err.message ||
					"An unexpected error occurred during classification.",
			);
			console.error("Classification failed:", err);
		} finally {
			setIsClassifying(false);
		}
	};

	const dismissError = () => setError(null);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-6">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="flex items-center justify-center space-x-3 mb-3">
						<div className="p-2 bg-green-600 rounded-lg">
							<FileText className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">
							Filipino Fake News Detection
						</h1>
					</div>
					<p className="text-base text-gray-600 max-w-4xl mx-auto">
						Comparative Analysis of Human-Written and AI-Generated
						Training Data Compositions across Three AI-Adoption
						Scenarios
					</p>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="classify" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="classify">
							Classify News
						</TabsTrigger>
						<TabsTrigger value="results">Study Results</TabsTrigger>
						<TabsTrigger value="about">About</TabsTrigger>
					</TabsList>

					<TabsContent value="classify" className="space-y-6">
						<NewsInput
							inputText={inputText}
							setInputText={setInputText}
							selectedModelsCount={selectedModels.length}
							isClassifying={isClassifying}
							onClassify={handleClassify}
						/>

						<ModelSelector
							selectedModels={selectedModels}
							setSelectedModels={setSelectedModels}
							metricsData={metricsData}
						/>

						<ContentTypeDefinitions />

						{/* Error screen */}
						{error && (
							<Alert variant="destructive" className="mt-6">
								<XCircle className="h-4 w-4" />
								<AlertTitle>Classification Error</AlertTitle>
								<AlertDescription className="flex items-start justify-between">
									<span className="mr-4">{error}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={dismissError}
										className="h-auto p-0 text-red-800 hover:text-red-900 hover:bg-red-100 shrink-0">
										Dismiss
									</Button>
								</AlertDescription>
							</Alert>
						)}

						<ClassificationResults results={results} />
					</TabsContent>

					<TabsContent value="results">
						<StudyResults />
					</TabsContent>

					<TabsContent value="about">
						<AboutSection />
					</TabsContent>
				</Tabs>

				<div className="mt-12 text-center text-sm text-gray-600">
					<p>Research conducted at Cavite State University</p>
					<p className="mt-1">
						For academic and research purposes only
					</p>
				</div>
			</div>
		</div>
	);
}
