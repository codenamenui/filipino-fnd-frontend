"use client";

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import type { ResultItem } from "@/types";

interface ClassificationResultsProps {
	results: ResultItem[] | null;
}

export default function ClassificationResults({
	results,
}: ClassificationResultsProps) {
	if (!results) return null;

	const fakeCount = results.filter((r) => r.prediction === "FAKE").length;
	const realCount = results.length - fakeCount;

	return (
		<Card className="mt-6">
			<CardHeader>
				<CardTitle>Classification Results</CardTitle>
				<CardDescription>
					Predictions from {results.length} selected model
					{results.length !== 1 ? "s" : ""} (30 total trained models)
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
											className={
												result.prediction === "FAKE"
													? "bg-red-600 hover:bg-red-700"
													: "bg-green-600 hover:bg-green-700"
											}>
											{result.prediction === "FAKE" ? (
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
}
