"use client";

import React, { useEffect, useRef, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ratioSuffixes = [
	"HF0-AIF100",
	"HF33-AIF67",
	"HF50-AIF50",
	"HF67-AIF33",
	"HF100-AIF0",
];

const conditionPrefix: Record<string, string> = {
	A: "HR100-AIR0",
	B: "HR67-AIR33",
	C: "HR50-AIR50",
};

const performanceData = {
	A: {
		label: "Condition A: Human-Only Real News (100% HR)",
		bert:  [72.10, 83.18, 84.62, 85.44, 74.97],
		distil:[75.28, 77.95, 79.64, 84.31, 76.82],
	},
	B: {
		label: "Condition B: Moderate AI-Augmented (67% HR, 33% AI-R)",
		bert:  [73.33, 91.18, 90.67, 92.62, 69.64],
		distil:[73.64, 87.90, 89.33, 89.54, 64.92],
	},
	C: {
		label: "Condition C: Balanced AI-Augmented (50% HR, 50% AI-R)",
		bert:  [74.36, 88.62, 90.56, 91.79, 65.54],
		distil:[73.85, 85.44, 88.72, 91.18, 69.33],
	},
};

const BERT_COLOR = "#378ADD";
const DISTIL_COLOR = "#1D9E75";
const BERT_COLOR_ALPHA = "rgba(55,138,221,0.75)";
const DISTIL_COLOR_ALPHA = "rgba(29,158,117,0.75)";

function HorizontalBarChart({
	condKey,
}: {
	condKey: keyof typeof performanceData;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const cond = performanceData[condKey];
	const prefix = conditionPrefix[condKey];
	const labels = ratioSuffixes.map((s) => `${prefix}-${s}`);

	useEffect(() => {
		if (!canvasRef.current) return;
		if (chartRef.current) chartRef.current.destroy();

		chartRef.current = new Chart(canvasRef.current, {
			type: "bar",
			data: {
				labels,
				datasets: [
					{
						label: "Tagalog-BERT",
						data: cond.bert,
						backgroundColor: BERT_COLOR_ALPHA,
						borderColor: BERT_COLOR,
						borderWidth: 1,
						borderRadius: 4,
						barPercentage: 0.9,
						categoryPercentage: 0.5,
						order: 1,
					},
					{
						label: "Tagalog-DistilBERT",
						data: cond.distil,
						backgroundColor: DISTIL_COLOR_ALPHA,
						borderColor: DISTIL_COLOR,
						borderWidth: 1,
						borderRadius: 4,
						barPercentage: 0.9,
						categoryPercentage: 0.5,
						order: 2,
					},
				],
			},
			options: {
				indexAxis: "y",
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) =>
								` ${ctx.dataset.label}: ${(ctx.parsed.x ?? 0).toFixed(2)}%`,
						},
					},
				},
				scales: {
					x: {
						min: 50,
						max: 100,
						ticks: {
							callback: (v) => v + "%",
							font: { size: 11 },
						},
						grid: { color: "rgba(128,128,128,0.15)" },
						title: {
							display: true,
							text: "Accuracy (%)",
							font: { size: 11 },
						},
					},
					y: {
						ticks: { font: { size: 11 } },
						title: {
							display: false,
						},
					},
				},
			},
		});

		return () => {
			chartRef.current?.destroy();
		};
	}, [condKey]);

	return (
		<div style={{ position: "relative", width: "100%", height: "320px" }}>
			<canvas
				ref={canvasRef}
				role="img"
				aria-label={`Horizontal bar chart showing accuracy for ${cond.label}`}
			/>
		</div>
	);
}

export default function PerformanceChart() {
	const [activeTab, setActiveTab] = useState<"A" | "B" | "C">("A");

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				{(["A", "B", "C"] as const).map((cond) => (
					<button
						key={cond}
						onClick={() => setActiveTab(cond)}
						className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
							activeTab === cond
								? "bg-green-600 text-white border-green-600"
								: "border-gray-300 text-gray-600 hover:bg-gray-50"
						}`}
					>
						Condition {cond}
					</button>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						{performanceData[activeTab].label}
					</CardTitle>
					<CardDescription>
						Overall accuracy comparison across HF:AI-F ratios
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 mb-3">
						<div className="flex items-center gap-2 text-xs text-gray-600">
							<div className="w-3 h-3 rounded-sm" style={{ background: BERT_COLOR }} />
							Tagalog-BERT
						</div>
						<div className="flex items-center gap-2 text-xs text-gray-600">
							<div className="w-3 h-3 rounded-sm" style={{ background: DISTIL_COLOR }} />
							Tagalog-DistilBERT
						</div>
					</div>
					<HorizontalBarChart condKey={activeTab} />
				</CardContent>
			</Card>
		</div>
	);
}