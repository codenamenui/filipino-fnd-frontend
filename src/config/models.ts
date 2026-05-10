import { ModelInfo } from "@/types";

export const architectures = ["Tagalog-BERT", "Tagalog-DistilBERT"];

export const conditions = [
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

export const ratios = ["100:0", "67:33", "50:50", "33:67", "0:100"];

export function buildModels(
	metricsData: Record<string, { accuracy: string; f1Score: string }>,
): ModelInfo[] {
	return architectures.flatMap((arch) =>
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
					ratio,
					accuracy: m.accuracy,
					f1Score: m.f1Score,
				};
			}),
		),
	);
}
