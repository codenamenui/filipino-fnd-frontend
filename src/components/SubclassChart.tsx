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

const ratioLabels = ["100:0", "67:33", "50:50", "33:67", "0:100"];

const subclassData = {
	A: {
		label: "Condition A:Human-Only Real News (100% HR)",
		bert: {
			HR:  [94.31, 99.19, 99.18, 98.77, 98.77],
			AIR: [75.31, 69.55, 76.34, 76.95, 80.25],
			HF:  [81.89, 72.84, 64.61, 58.02,  9.05],
			AIF: [48.15,100.00, 98.16, 98.78,100.00],
		},
		distil: {
			HR:  [91.46, 96.75, 94.89, 95.88,100.00],
			AIR: [51.85, 62.14, 52.26, 57.20, 79.42],
			HF:  [76.13, 78.19, 71.81, 59.26, 22.63],
			AIF: [87.65,100.00, 99.39, 99.19, 98.78],
		},
	},
	B: {
		label: "Condition B: Moderate AI-Augmented (67% HR, 33% AI-R)",
		bert: {
			HR:  [92.68, 98.78, 97.56, 98.78, 99.59],
			AIR: [82.72, 91.77, 86.42, 93.00, 94.24],
			HF:  [81.07, 82.72, 79.42, 72.84,  0.82],
			AIF: [21.81, 97.12, 99.18,100.00, 98.35],
		},
		distil: {
			HR:  [90.65, 97.56, 96.75, 96.34,100.00],
			AIR: [82.72, 85.19, 86.01, 81.89, 88.48],
			HF:  [72.84, 77.37, 75.31, 73.25,  6.17],
			AIF: [13.17, 97.94, 99.18,100.00, 99.59],
		},
	},
	C: {
		label: "Condition C: Balanced AI-Augmented (50% HR, 50% AI-R)",
		bert: {
			HR:  [93.09, 98.78, 97.56,100.00,100.00],
			AIR: [90.53, 93.00, 87.65, 94.65, 99.18],
			HF:  [75.31, 78.60, 76.95, 60.49,  0.00],
			AIF: [ 2.88, 96.71,100.00, 99.18, 97.94],
		},
		distil: {
			HR:  [93.50, 97.97, 95.53, 98.37,100.00],
			AIR: [93.00, 87.65, 83.54, 87.65, 90.12],
			HF:  [83.95, 81.89, 76.54, 56.38,  5.35],
			AIF: [ 6.58, 97.12, 99.18, 99.18, 99.59],
		},
	},
};

const classColors: Record<string, { border: string; bg: string; dash: number[] }> = {
	HR:  { border: "#378ADD", bg: "rgba(55,138,221,0.15)",  dash: [] },
	AIR: { border: "#1D9E75", bg: "rgba(29,158,117,0.15)",  dash: [5,3] },
	HF:  { border: "#D85A30", bg: "rgba(216,90,48,0.15)",   dash: [] },
	AIF: { border: "#BA7517", bg: "rgba(186,117,23,0.15)",  dash: [5,3] },
};

const classLabels: Record<string, string> = {
	HR: "HR", AIR: "AI-R", HF: "HF", AIF: "AI-F",
};

function getHeatColor(val: number) {
	if (val >= 90) return { bg: "#1D9E75", text: "#085041" };
	if (val >= 75) return { bg: "#378ADD", text: "#042C53" };
	if (val >= 50) return { bg: "#EF9F27", text: "#412402" };
	return { bg: "#E24B4A", text: "#501313" };
}

function SubclassLineChart({
	condKey,
	arch,
}: {
	condKey: keyof typeof subclassData;
	arch: "bert" | "distil";
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart | null>(null);
	const cond = subclassData[condKey];
	const archData = cond[arch];
	const archLabel = arch === "bert" ? "Tagalog-BERT" : "Tagalog-DistilBERT";

	useEffect(() => {
		if (!canvasRef.current) return;
		if (chartRef.current) chartRef.current.destroy();

		const datasets = (["HR", "AIR", "HF", "AIF"] as const).map((cls) => ({
			label: classLabels[cls],
			data: archData[cls],
			borderColor: classColors[cls].border,
			backgroundColor: classColors[cls].bg,
			borderDash: classColors[cls].dash,
			borderWidth: 2,
			pointRadius: 4,
			tension: 0.3,
			fill: false,
		}));

		chartRef.current = new Chart(canvasRef.current, {
			type: "line",
			data: { labels: ratioLabels, datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) =>
								` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(2)}%`,
						},
					},
				},
				scales: {
					y: {
						min: 0,
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
					x: {
						ticks: { font: { size: 11 } },
						title: {
							display: true,
							text: "HF:AI-F Ratio",
							font: { size: 11 },
						},
					},
				},
			},
		});

		return () => { chartRef.current?.destroy(); };
	}, [condKey, arch]);

	return (
		<div>
			<p className="text-sm font-medium text-gray-700 mb-2">{archLabel}</p>
			<div className="flex flex-wrap gap-3 mb-2">
				{(["HR", "AIR", "HF", "AIF"] as const).map((cls) => (
					<div key={cls} className="flex items-center gap-1 text-xs text-gray-600">
						<div
							className="w-6 h-0"
							style={{
								borderTop: `2px ${classColors[cls].dash.length ? "dashed" : "solid"} ${classColors[cls].border}`,
							}}
						/>
						{classLabels[cls]}
					</div>
				))}
			</div>
			<div style={{ position: "relative", width: "100%", height: "220px" }}>
				<canvas
					ref={canvasRef}
					role="img"
					aria-label={`Line chart of subclass accuracy for ${archLabel} under ${cond.label}`}
				/>
			</div>
		</div>
	);
}

function HeatmapTable({ condKey }: { condKey: keyof typeof subclassData }) {
	const cond = subclassData[condKey];
	const archs: Array<{ key: "bert" | "distil"; label: string }> = [
		{ key: "bert", label: "Tagalog-BERT" },
		{ key: "distil", label: "Tagalog-DistilBERT" },
	];
	const classes = ["HR", "AIR", "HF", "AIF"] as const;

	return (
		<div className="overflow-x-auto mt-4">
			<table className="w-full text-xs border-collapse">
				<thead>
					<tr>
						<th className="text-left px-2 py-1 text-gray-500 font-normal w-48">Model</th>
						<th className="text-left px-2 py-1 text-gray-500 font-normal w-32">Ratio</th>
						{classes.map((cls) => (
							<th key={cls} className="text-center px-2 py-1 text-gray-500 font-normal">
								{classLabels[cls]}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{archs.map(({ key, label }) =>
						ratioLabels.map((ratio, i) => {
							const row = cond[key];
							return (
								<tr key={`${key}-${ratio}`} className="border-t border-gray-100">
									{i === 0 && (
										<td
											rowSpan={5}
											className="px-2 py-1 text-gray-700 font-medium align-top pt-2"
										>
											{label}
										</td>
									)}
									<td className="px-2 py-1 text-gray-500">{ratio}</td>
									{classes.map((cls) => {
										const val = row[cls][i];
										const { bg, text } = getHeatColor(val);
										return (
											<td key={cls} className="px-1 py-1 text-center">
												<div
													className="rounded px-1 py-0.5 font-medium"
													style={{ background: bg, color: text }}
												>
													{val.toFixed(1)}%
												</div>
											</td>
										);
									})}
								</tr>
							);
						})
					)}
				</tbody>
			</table>
			<div className="flex gap-4 mt-3 flex-wrap">
				{[
					{ color: "#1D9E75", text: "#085041", label: "≥90%" },
					{ color: "#378ADD", text: "#042C53", label: "75–89%" },
					{ color: "#EF9F27", text: "#412402", label: "50–74%" },
					{ color: "#E24B4A", text: "#501313", label: "<50%" },
				].map(({ color, text, label }) => (
					<div key={label} className="flex items-center gap-1 text-xs text-gray-600">
						<div
							className="w-3 h-3 rounded-sm"
							style={{ background: color }}
						/>
						<span style={{ color: text !== "#042C53" ? undefined : undefined }}>{label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default function SubclassChart() {
	const [activeTab, setActiveTab] = useState<"A" | "B" | "C">("A");

	return (
		<div className="space-y-6">
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
						{subclassData[activeTab].label}
					</CardTitle>
					<CardDescription>
						Per-class accuracy across HF:AI-F ratios for each architecture
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<SubclassLineChart condKey={activeTab} arch="bert" />
						<SubclassLineChart condKey={activeTab} arch="distil" />
					</div>

					<div>
						<p className="text-sm font-medium text-gray-700 mb-1">
							Heatmap
						</p>
						<HeatmapTable condKey={activeTab} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}