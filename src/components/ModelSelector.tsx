"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	architectures,
	conditions,
	ratios,
	buildModels,
} from "@/config/models";
import type { ModelInfo } from "@/types";

interface ModelSelectorProps {
	selectedModels: string[];
	setSelectedModels: React.Dispatch<React.SetStateAction<string[]>>;
	metricsData: Record<string, { accuracy: string; f1Score: string }>;
}

export default function ModelSelector({
	selectedModels,
	setSelectedModels,
	metricsData,
}: ModelSelectorProps) {
	const [checkedArchitectures, setCheckedArchitectures] = useState<string[]>(
		[],
	);
	const [checkedConditions, setCheckedConditions] = useState<string[]>([]);
	const [checkedRatios, setCheckedRatios] = useState<string[]>([]);

	const models = buildModels(metricsData);

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
		checkedArchitectures.forEach((arch) =>
			checkedConditions.forEach((condId) =>
				checkedRatios.forEach((ratio) => {
					const id = `${arch}-${condId}-${ratio}`;
					if (!newIds.includes(id)) newIds.push(id);
				}),
			),
		);

		setSelectedModels((prev) => {
			const merged = [...prev];
			newIds.forEach((id) => {
				if (!merged.includes(id)) merged.push(id);
			});
			return merged;
		});
	};

	const removeModel = (modelId: string) => {
		setSelectedModels((prev) => prev.filter((id) => id !== modelId));
	};

	const selectedModelsList = selectedModels
		.map((id) => models.find((m) => m.id === id))
		.filter(Boolean) as ModelInfo[];

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>Select Models</CardTitle>
						<CardDescription>
							Choose architectures, conditions, and ratios then
							click Apply
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
								{checkedArchitectures.length} arch ×{" "}
								{checkedConditions.length} cond ×{" "}
								{checkedRatios.length} ratio ={" "}
								{checkedArchitectures.length *
									checkedConditions.length *
									checkedRatios.length}{" "}
								model(s)
							</p>
							<Button
								onClick={handleApplySelection}
								disabled={
									checkedArchitectures.length === 0 ||
									checkedConditions.length === 0 ||
									checkedRatios.length === 0
								}
								className="bg-green-600 hover:bg-green-700">
								Apply Selection
							</Button>
						</div>
					</div>

					{/* Selected Models List */}
					{selectedModelsList.length > 0 && (
						<div className="border rounded-lg p-4">
							<p className="text-sm font-medium text-gray-700 mb-3">
								Selected Models ({selectedModelsList.length})
							</p>
							<div className="space-y-2">
								{selectedModelsList.map((model) => (
									<div
										key={model.id}
										className="flex items-center justify-between bg-gray-50 p-3 rounded">
										<div>
											<p className="text-sm font-medium text-gray-900">
												{model.architecture}
											</p>
											<p className="text-xs text-gray-600">
												{model.conditionDescription} |
												Ratio: {model.ratio} (HF:AI-F)
											</p>
										</div>
										<Button
											onClick={() =>
												removeModel(model.id)
											}
											variant="ghost"
											size="sm"
											className="text-red-600 hover:text-red-700 hover:bg-red-50">
											Remove
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
