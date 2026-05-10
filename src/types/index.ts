export interface ModelInfo {
	id: string;
	architecture: string;
	condition: string;
	conditionId: string;
	conditionDescription: string;
	ratio: string;
	accuracy: string;
	f1Score: string;
}

export interface ResultItem {
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

export interface SampleArticles {
	HR: string;
	"AI-R": string;
	HF: string;
	"AI-F": string;
}
