"use client";

import React, { useState, useEffect } from "react";
import {
	AlertCircle,
	CheckCircle,
	XCircle,
	FileText,
	Loader2,
	BarChart3,
	TrendingUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------- Type definitions ----------
interface ModelInfo {
	id: string;
	architecture: string;
	condition: string;
	conditionId: string;
	conditionDescription: string;
	ratio: string;
	accuracy: string;
	f1Score: string;
}

interface ResultItem {
	model_id: string;
	architecture: string;
	condition: string;
	ratio: string;
	prediction: string;
	confidence: number;
	model: {
		architecture: string;
		condition: string;
		ratio: string;
		accuracy: string;
		f1Score: string;
	};
}

// ---------- Main component ----------
const FilipinoFNDDemo = () => {
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	const [inputText, setInputText] = useState("");
	const [isClassifying, setIsClassifying] = useState(false);
	const [results, setResults] = useState<ResultItem[] | null>(null);
	const [metricsData, setMetricsData] = useState<
		Record<string, { accuracy: string; f1Score: string }>
	>({});

	// Checkbox states
	const [checkedArchitectures, setCheckedArchitectures] = useState<string[]>(
		[],
	);
	const [checkedConditions, setCheckedConditions] = useState<string[]>([]);
	const [checkedRatios, setCheckedRatios] = useState<string[]>([]);

	useEffect(() => {
		fetch("/metrics.json")
			.then((res) => res.json())
			.then((data) => setMetricsData(data))
			.catch((err) => console.error("Failed to load metrics:", err));
	}, []);

	const architectures = ["Tagalog-BERT", "Tagalog-DistilBERT"];
	const conditions = [
		{
			id: "A",
			name: "Condition A: Human-Only Real News (100% HR)",
			description: "100% HR",
		},
		{
			id: "B",
			name: "Condition B: Moderate AI-Augmented (67:33)",
			description: "67% HR, 33% AI-R",
		},
		{
			id: "C",
			name: "Condition C: Balanced AI-Augmented (50:50)",
			description: "50% HR, 50% AI-R",
		},
	];
	const ratios = ["100:0", "67:33", "50:50", "33:67", "0:100"];

	const models: ModelInfo[] = architectures.flatMap((arch) =>
		conditions.flatMap((cond) =>
			ratios.map((ratio) => {
				const id = `${arch}-${cond.id}-${ratio}`;
				const m = metricsData[id] ?? {
					accuracy: "N/A",
					f1Score: "N/A",
				};
				return {
					id,
					architecture: arch,
					condition: cond.name,
					conditionId: cond.id,
					conditionDescription: cond.description,
					ratio: ratio,
					accuracy: m.accuracy,
					f1Score: m.f1Score,
				};
			}),
		),
	);

	const sampleArticles = {
		HR: "Inaprubahan ng Senado ang bagong batas para sa proteksyon ng mga manggagawa. Ayon sa sponsor ng panukalang batas, layunin nitong palakasin ang mga karapatan ng mga empleyado sa iba't ibang industriya. Ang batas ay naglalayong magbigay ng mas mataas na minimum wage at mas maayos na working conditions.",
		"AI-R": "Naglunsad ang Department of Health ng bagong vaccination program para sa mga bata. Ang programa ay bahagi ng comprehensive health initiative na naglalayong mapataas ang immunization coverage sa buong bansa. According to health officials, target nilang maabot ang 95% vaccination rate sa loob ng tatlong taon.",
		HF: "BREAKING: Umano'y nadakip ang kilalang artista sa drug raid! Ayon sa source, nahuli raw siya ng PDEA agents sa isang luxury hotel sa Makati. Netizens ay shocked sa balitang ito. Nakakalat na sa social media ang mga video ng operasyon. Diumano, may malaking halaga ng illegal drugs na narekober.",
		"AI-F": "Naglabas ng official statement ang WHO na ang bagong variant ng virus ay may 90% fatality rate sa Pilipinas. Government sources confirm na may lockdown protocols na ipinatutupad nationwide effective immediately. Medical experts warn na ang healthcare system ay malapit nang mag-collapse. Thousands of cases reported daily according to DOH data.",
	};

	type SampleKey = keyof typeof sampleArticles;

	const toggleItem = (
		item: string,
		list: string[],
		setList: (v: string[]) => void,
	) => {
		setList(
			list.includes(item)
				? list.filter((i) => i !== item)
				: [...list, item],
		);
	};

	const handleApplySelection = () => {
		if (
			checkedArchitectures.length === 0 ||
			checkedConditions.length === 0 ||
			checkedRatios.length === 0
		)
			return;

		const newIds: string[] = [];
		checkedArchitectures.forEach((arch) => {
			checkedConditions.forEach((condId) => {
				checkedRatios.forEach((ratio) => {
					const id = `${arch}-${condId}-${ratio}`;
					if (!newIds.includes(id)) newIds.push(id);
				});
			});
		});

		setSelectedModels((prev) => {
			const merged = [...prev];
			newIds.forEach((id) => {
				if (!merged.includes(id)) merged.push(id);
			});
			return merged;
		});
	};

	const handleRemoveModel = (modelId: string) => {
		setSelectedModels((prev) => prev.filter((id) => id !== modelId));
	};

	const handleClassify = async () => {
		if (selectedModels.length === 0 || !inputText.trim()) return;

		setIsClassifying(true);
		setResults(null);

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
				throw new Error(`Server error: ${response.status}`);
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
			}
		} catch (error) {
			console.error("Classification failed:", error);
		} finally {
			setIsClassifying(false);
		}
	};

	const handleLoadSample = (type: SampleKey) => {
		setInputText(sampleArticles[type]);
	};

	const renderResults = () => {
		if (!results) return null;

		const fakeCount = results.filter((r) => r.prediction === "FAKE").length;
		const realCount = results.length - fakeCount;

		return (
			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Classification Results</CardTitle>
					<CardDescription>
						Predictions from {results.length} selected model
						{results.length !== 1 ? "s" : ""} (30 total trained
						models)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert className="mb-6">
						<AlertDescription>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-6">
									<div className="text-center">
										<div className="text-2xl font-bold text-green-600">
											{realCount}
										</div>
										<div className="text-sm text-gray-600">
											predict REAL
										</div>
									</div>
									<div className="text-gray-300">|</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-red-600">
											{fakeCount}
										</div>
										<div className="text-sm text-gray-600">
											predict FAKE
										</div>
									</div>
								</div>
								<div className="text-right">
									<div className="text-lg font-semibold text-gray-900">
										Consensus:{" "}
										<span
											className={
												fakeCount > realCount
													? "text-red-600"
													: "text-green-600"
											}>
											{fakeCount > realCount
												? "FAKE"
												: "REAL"}
										</span>
									</div>
									<div className="text-sm text-gray-600">
										{Math.max(fakeCount, realCount)} out of{" "}
										{results.length} models
									</div>
								</div>
							</div>
						</AlertDescription>
					</Alert>

					<div className="space-y-4">
						{results.map((result, idx) => (
							<Card key={idx}>
								<CardContent className="pt-6">
									<div className="flex items-start justify-between mb-4">
										<div>
											<div className="font-semibold text-gray-900">
												{result.model.architecture}
											</div>
											<div className="text-sm text-gray-600">
												{result.model.condition}
											</div>
											<div className="text-sm text-gray-600">
												Ratio: {result.model.ratio}{" "}
												(HF:AI-F)
											</div>
										</div>
										<div className="text-right">
											<Badge
												className={`${
													result.prediction === "FAKE"
														? "bg-red-600 hover:bg-red-700"
														: "bg-green-600 hover:bg-green-700"
												}`}>
												{result.prediction ===
												"FAKE" ? (
													<XCircle className="w-3 h-3 mr-1" />
												) : (
													<CheckCircle className="w-3 h-3 mr-1" />
												)}
												{result.prediction}
											</Badge>
											<div className="text-sm text-gray-600 mt-1">
												{result.confidence}% confidence
											</div>
										</div>
									</div>

									<Progress
										value={Number(result.confidence)}
										className={`h-3 mb-3 ${
											result.prediction === "FAKE"
												? "[&>div]:bg-red-500"
												: "[&>div]:bg-green-500"
										}`}
									/>

									<div className="flex justify-between text-xs text-gray-600">
										<span>
											Accuracy: {result.model.accuracy}
										</span>
										<span>F1: {result.model.f1Score}</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-6">
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

				<Tabs defaultValue="classify" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="classify">
							Classify News
						</TabsTrigger>
						<TabsTrigger value="results">Study Results</TabsTrigger>
						<TabsTrigger value="about">About</TabsTrigger>
					</TabsList>

					{/* ===== Classify Tab ===== */}
					<TabsContent value="classify" className="space-y-6">
						{/* Input Card */}
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
												onClick={() =>
													handleLoadSample("HR")
												}
												variant="outline"
												size="sm">
												Human Real
											</Button>
											<Button
												onClick={() =>
													handleLoadSample("AI-R")
												}
												variant="outline"
												size="sm">
												AI-Enhanced Real
											</Button>
											<Button
												onClick={() =>
													handleLoadSample("HF")
												}
												variant="outline"
												size="sm">
												Human Fake
											</Button>
											<Button
												onClick={() =>
													handleLoadSample("AI-F")
												}
												variant="outline"
												size="sm">
												AI-Generated Fake
											</Button>
										</div>
									</div>

									<Textarea
										value={inputText}
										onChange={(e) =>
											setInputText(e.target.value)
										}
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
												onClick={handleClassify}
												disabled={
													selectedModels.length ===
														0 ||
													!inputText.trim() ||
													isClassifying
												}
												className="bg-green-600 hover:bg-green-700">
												{isClassifying && (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												)}
												{isClassifying
													? "Classifying..."
													: "Classify"}
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Model Selection Card */}
						<Card>
							<CardHeader>
								<div className="flex justify-between items-center">
									<div>
										<CardTitle>Select Models</CardTitle>
										<CardDescription>
											Choose architectures, conditions,
											and ratios then click Apply
										</CardDescription>
									</div>
									<Button
										onClick={() => setSelectedModels([])}
										variant="outline"
										size="sm">
										Clear All
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									<div className="border rounded-lg p-4 bg-gray-50 space-y-4">
										{/* Architecture */}
										<div>
											<p className="text-sm font-medium text-gray-700 mb-2">
												Architecture
											</p>
											<div className="flex flex-col gap-2">
												{architectures.map((arch) => (
													<label
														key={arch}
														className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
														<input
															type="checkbox"
															checked={checkedArchitectures.includes(
																arch,
															)}
															onChange={() =>
																toggleItem(
																	arch,
																	checkedArchitectures,
																	setCheckedArchitectures,
																)
															}
															className="accent-green-600 w-4 h-4"
														/>
														{arch}
													</label>
												))}
											</div>
										</div>

										<div className="border-t border-gray-200" />

										{/* Condition */}
										<div>
											<p className="text-sm font-medium text-gray-700 mb-2">
												Condition
											</p>
											<div className="flex flex-col gap-2">
												{conditions.map((cond) => (
													<label
														key={cond.id}
														className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
														<input
															type="checkbox"
															checked={checkedConditions.includes(
																cond.id,
															)}
															onChange={() =>
																toggleItem(
																	cond.id,
																	checkedConditions,
																	setCheckedConditions,
																)
															}
															className="accent-green-600 w-4 h-4"
														/>
														{cond.name}
													</label>
												))}
											</div>
										</div>

										<div className="border-t border-gray-200" />

										{/* Ratio */}
										<div>
											<p className="text-sm font-medium text-gray-700 mb-2">
												HF:AI-F Ratio
											</p>
											<div className="flex flex-col gap-2">
												{ratios.map((ratio) => (
													<label
														key={ratio}
														className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
														<input
															type="checkbox"
															checked={checkedRatios.includes(
																ratio,
															)}
															onChange={() =>
																toggleItem(
																	ratio,
																	checkedRatios,
																	setCheckedRatios,
																)
															}
															className="accent-green-600 w-4 h-4"
														/>
														{ratio} (HF:AI-F)
													</label>
												))}
											</div>
										</div>

										<div className="border-t border-gray-200" />

										{/* Apply */}
										<div className="flex items-center justify-between">
											<p className="text-xs text-gray-500">
												{checkedArchitectures.length}{" "}
												arch ×{" "}
												{checkedConditions.length} cond
												× {checkedRatios.length} ratio ={" "}
												{checkedArchitectures.length *
													checkedConditions.length *
													checkedRatios.length}{" "}
												model(s)
											</p>
											<Button
												onClick={handleApplySelection}
												disabled={
													checkedArchitectures.length ===
														0 ||
													checkedConditions.length ===
														0 ||
													checkedRatios.length === 0
												}
												className="bg-green-600 hover:bg-green-700">
												Apply Selection
											</Button>
										</div>
									</div>

									{/* Selected Models List */}
									{selectedModels.length > 0 && (
										<div className="border rounded-lg p-4">
											<p className="text-sm font-medium text-gray-700 mb-3">
												Selected Models (
												{selectedModels.length})
											</p>
											<div className="space-y-2">
												{selectedModels.map(
													(modelId) => {
														const model =
															models.find(
																(m) =>
																	m.id ===
																	modelId,
															);
														if (!model) return null;
														return (
															<div
																key={modelId}
																className="flex items-center justify-between bg-gray-50 p-3 rounded">
																<div className="flex-1">
																	<p className="text-sm font-medium text-gray-900">
																		{
																			model.architecture
																		}
																	</p>
																	<p className="text-xs text-gray-600">
																		{
																			model.conditionDescription
																		}{" "}
																		| Ratio:{" "}
																		{
																			model.ratio
																		}{" "}
																		(HF:AI-F)
																	</p>
																</div>
																<Button
																	onClick={() =>
																		handleRemoveModel(
																			modelId,
																		)
																	}
																	variant="ghost"
																	size="sm"
																	className="text-red-600 hover:text-red-700 hover:bg-red-50">
																	Remove
																</Button>
															</div>
														);
													},
												)}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Content Type Definitions Card */}
						<Card>
							<CardHeader>
								<CardTitle>Content Type Definitions</CardTitle>
								<CardDescription>
									Understanding the four types of content used
									in this research
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4">
									<div className="border-l-4 border-green-600 pl-4 py-2">
										<p className="font-semibold text-gray-900">
											HR (Human-Written Real News)
										</p>
										<p className="text-sm text-gray-600">
											Authentic news articles written
											entirely by human journalists from
											established mainstream outlets
										</p>
									</div>
									<div className="border-l-4 border-blue-600 pl-4 py-2">
										<p className="font-semibold text-gray-900">
											AI-R (AI-Enhanced Real News)
										</p>
										<p className="text-sm text-gray-600">
											Factually accurate news rewritten
											and expanded by GPT-4 while
											preserving all original facts and
											claims
										</p>
									</div>
									<div className="border-l-4 border-orange-600 pl-4 py-2">
										<p className="font-semibold text-gray-900">
											HF (Human-Written Fake News)
										</p>
										<p className="text-sm text-gray-600">
											Fabricated misinformation created by
											human authors, collected from
											verified fake news sources
										</p>
									</div>
									<div className="border-l-4 border-red-600 pl-4 py-2">
										<p className="font-semibold text-gray-900">
											AI-F (AI-Generated Fake News)
										</p>
										<p className="text-sm text-gray-600">
											Fabricated misinformation produced
											by GPT-4 using prompts designed to
											mimic Filipino fake news
											characteristics
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Results */}
						{renderResults()}
					</TabsContent>

					{/* ===== Results Tab ===== */}
					<TabsContent value="results">
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>
										Performance Across Training
										Configurations
									</CardTitle>
									<CardDescription>
										Accuracy trends across three AI-adoption
										conditions (A: Human-Only, B: Moderate
										[67:33], C: Balanced [50:50]) and five
										HF:AI-F ratios (100:0 to 0:100)
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
										<BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-3" />
										<p className="text-gray-600 font-medium">
											Interactive Performance Charts
										</p>
										<p className="text-sm text-gray-500 mt-2">
											Visualization will display
											comparative analysis across all
											training configurations
										</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>
										Subclass-Wise Accuracy
									</CardTitle>
									<CardDescription>
										Performance breakdown for HR, AI-R, HF,
										and AI-F content types
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
										<TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-3" />
										<p className="text-gray-600 font-medium">
											Heatmap Visualization
										</p>
										<p className="text-sm text-gray-500 mt-2">
											Detailed accuracy metrics for each
											content type across model
											configurations
										</p>
									</div>
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
												2 architectures × 3 conditions ×
												5 ratios
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
												2,166 human + 2,166 AI-generated
												articles
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
					</TabsContent>

					{/* ===== About Tab ===== */}
					<TabsContent value="about">
						<Card>
							<CardHeader>
								<CardTitle>About This Research</CardTitle>
								<CardDescription>
									Comparative analysis of training data
									compositions for Filipino fake news
									detection
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<p className="text-gray-700">
										This web demonstration showcases 30
										trained BERT-based models for detecting
										fake news in Filipino language content.
										The research investigates how different
										compositions of human-written and
										AI-generated training data, across three
										progressive AI-adoption scenarios,
										affect model performance and robustness.
										The complete dataset comprises 4,332
										Filipino news articles: 1,083
										human-written real news (HR), 1,083
										AI-enhanced real news (AI-R), 1,083
										human-written fake news (HF), and 1,083
										AI-generated fake news (AI-F).
									</p>
								</div>

								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										Research Objectives
									</h3>
									<div className="space-y-3 text-gray-700">
										<div className="flex items-start">
											<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
												1.
											</span>
											<span>
												To construct a comprehensive
												dataset comprising 4,332
												Filipino news articles across
												four distinct content types
												(human-written real news,
												AI-enhanced real news,
												human-written fake news, and
												AI-generated fake news) to
												enable controlled
												experimentation with varied
												training data compositions
												representing different stages of
												AI adoption in news production.
											</span>
										</div>
										<div className="flex items-start">
											<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
												2.
											</span>
											<span>
												To train 30 BERT-based detection
												models using two architectures
												(Tagalog-BERT,
												Tagalog-DistilBERT) across three
												real news conditions (100% HR,
												67:33 HR:AI-R, 50:50 HR:AI-R)
												and five fake news ratios (100:0
												to 0:100 HF:AI-F),
												systematically isolating the
												effects of training data
												composition on model
												performance.
											</span>
										</div>
										<div className="flex items-start">
											<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
												3.
											</span>
											<div>
												<span>
													To evaluate and
													statistically compare all
													trained models using
													comprehensive metrics and
													rigorous statistical testing
													to identify significant
													performance differences and
													determine optimal training
													configurations,
													specifically:
												</span>
												<ul className="ml-6 mt-2 space-y-1 text-sm">
													<li>
														• Threshold-dependent
														metrics (accuracy,
														precision, recall,
														F1-score) for
														classification
														performance
													</li>
													<li>
														• Subclass-wise accuracy
														analysis across all four
														content types (HR, AI-R,
														HF, AI-F)
													</li>
													<li>
														• Statistical
														significance testing
														using McNemar's test
														with Benjamini-Hochberg
														FDR correction
													</li>
												</ul>
											</div>
										</div>
										<div className="flex items-start">
											<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
												4.
											</span>
											<span>
												To analyze cross-content-type
												generalization patterns and
												detection biases by examining
												model performance across HR,
												AI-R, HF, and AI-F test samples,
												identifying whether models rely
												on factuality-based features or
												source-detection shortcuts, and
												determining which training
												compositions achieve balanced,
												unbiased detection across all
												content types.
											</span>
										</div>
										<div className="flex items-start">
											<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
												5.
											</span>
											<span>
												To synthesize experimental
												findings into evidence-based
												training recommendations by
												identifying
												architecture-invariant patterns,
												optimal data composition
												strategies, and practical
												deployment considerations for
												developing robust Filipino fake
												news detection systems.
											</span>
										</div>
										<div className="flex items-start">
											<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
												6.
											</span>
											<span>
												To develop a web-based
												demonstration platform that
												showcases the trained models'
												performance and allows users to
												interact with the detection
												system, enabling practical
												testing with Filipino-language
												news content and demonstrating
												real-world applicability of the
												research findings.
											</span>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										Model Architectures
									</h3>
									<div className="space-y-3">
										<div className="border-l-4 border-green-600 pl-4 py-2">
											<p className="font-semibold text-gray-900">
												Tagalog-BERT
											</p>
											<p className="text-sm text-gray-600">
												Language-specific model
												pre-trained on Filipino corpora
											</p>
										</div>
										<div className="border-l-4 border-green-600 pl-4 py-2">
											<p className="font-semibold text-gray-900">
												Tagalog-DistilBERT
											</p>
											<p className="text-sm text-gray-600">
												Efficient distilled version with
												40% smaller size
											</p>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										Training Conditions
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="border rounded-lg p-4">
											<p className="font-semibold text-gray-900 mb-2">
												Condition A
											</p>
											<p className="text-sm text-gray-700">
												Human-Only Real News
											</p>
											<p className="text-xs text-gray-500 mt-1">
												100% human-written real news
											</p>
											<p className="text-xs text-gray-500">
												Baseline condition
											</p>
										</div>
										<div className="border rounded-lg p-4">
											<p className="font-semibold text-gray-900 mb-2">
												Condition B
											</p>
											<p className="text-sm text-gray-700">
												Moderate AI-Augmented
											</p>
											<p className="text-xs text-gray-500 mt-1">
												67% human-written, 33%
												AI-enhanced
											</p>
											<p className="text-xs text-gray-500">
												Early AI integration stage
											</p>
										</div>
										<div className="border rounded-lg p-4">
											<p className="font-semibold text-gray-900 mb-2">
												Condition C
											</p>
											<p className="text-sm text-gray-700">
												Balanced AI-Augmented
											</p>
											<p className="text-xs text-gray-500 mt-1">
												50% human-written, 50%
												AI-enhanced
											</p>
											<p className="text-xs text-gray-500">
												Mature AI adoption stage
											</p>
										</div>
									</div>
								</div>

								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="ml-2">
										<strong>Note:</strong> This is a
										research prototype. All AI-generated
										content was created solely for academic
										purposes to study detection methods. The
										models are trained to identify
										misinformation patterns in Filipino
										language content.
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
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
};

export default FilipinoFNDDemo;
