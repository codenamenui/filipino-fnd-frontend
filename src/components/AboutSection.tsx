import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AboutSection() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>About This Research</CardTitle>
				<CardDescription>
					Comparative analysis of training data compositions for
					Filipino fake news detection
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div>
					<p className="text-gray-700">
						This web demonstration showcases 30 trained BERT-based
						models for detecting fake news in Filipino language
						content. The research investigates how different
						compositions of human-written and AI-generated training
						data, across three progressive AI-adoption scenarios,
						affect model performance and robustness. The complete
						dataset comprises 4,332 Filipino news articles: 1,083
						human-written real news (HR), 1,083 AI-enhanced real
						news (AI-R), 1,083 human-written fake news (HF), and
						1,083 AI-generated fake news (AI-F).
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
								To construct a comprehensive dataset comprising
								4,332 Filipino news articles across four
								distinct content types (human-written real news,
								AI-enhanced real news, human-written fake news,
								and AI-generated fake news) to enable controlled
								experimentation with varied training data
								compositions representing different stages of AI
								adoption in news production.
							</span>
						</div>
						<div className="flex items-start">
							<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
								2.
							</span>
							<span>
								To train 30 BERT-based detection models using
								two architectures (Tagalog-BERT,
								Tagalog-DistilBERT) across three real news
								conditions (100% HR, 67:33 HR:AI-R, 50:50
								HR:AI-R) and five fake news ratios (100:0 to
								0:100 HF:AI-F), systematically isolating the
								effects of training data composition on model
								performance.
							</span>
						</div>
						<div className="flex items-start">
							<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
								3.
							</span>
							<div>
								<span>
									To evaluate and statistically compare all
									trained models using comprehensive metrics
									and rigorous statistical testing to identify
									significant performance differences and
									determine optimal training configurations,
									specifically:
								</span>
								<ul className="ml-6 mt-2 space-y-1 text-sm">
									<li>
										• Threshold-dependent metrics (accuracy,
										precision, recall, F1-score) for
										classification performance
									</li>
									<li>
										• Subclass-wise accuracy analysis across
										all four content types (HR, AI-R, HF,
										AI-F)
									</li>
									<li>
										• Statistical significance testing using
										McNemar&apos;s test with
										Benjamini-Hochberg FDR correction
									</li>
								</ul>
							</div>
						</div>
						<div className="flex items-start">
							<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
								4.
							</span>
							<span>
								To analyze cross-content-type generalization
								patterns and detection biases by examining model
								performance across HR, AI-R, HF, and AI-F test
								samples, identifying whether models rely on
								factuality-based features or source-detection
								shortcuts, and determining which training
								compositions achieve balanced, unbiased
								detection across all content types.
							</span>
						</div>
						<div className="flex items-start">
							<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
								5.
							</span>
							<span>
								To synthesize experimental findings into
								evidence-based training recommendations by
								identifying architecture-invariant patterns,
								optimal data composition strategies, and
								practical deployment considerations for
								developing robust Filipino fake news detection
								systems.
							</span>
						</div>
						<div className="flex items-start">
							<span className="font-semibold text-gray-700 mr-2 mt-0.5 shrink-0">
								6.
							</span>
							<span>
								To develop a web-based demonstration platform
								that showcases the trained models&apos;
								performance and allows users to interact with
								the detection system, enabling practical testing
								with Filipino-language news content and
								demonstrating real-world applicability of the
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
								Language-specific model pre-trained on Filipino
								corpora
							</p>
						</div>
						<div className="border-l-4 border-green-600 pl-4 py-2">
							<p className="font-semibold text-gray-900">
								Tagalog-DistilBERT
							</p>
							<p className="text-sm text-gray-600">
								Efficient distilled version with 40% smaller
								size
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
								67% human-written, 33% AI-enhanced
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
								50% human-written, 50% AI-enhanced
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
						<strong>Note:</strong> This is a research prototype. All
						AI-generated content was created solely for academic
						purposes to study detection methods. The models are
						trained to identify misinformation patterns in Filipino
						language content.
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
}
