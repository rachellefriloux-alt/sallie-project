/**
 * Response Planner
 * Plans multi-step responses for complex interactions
 */

export interface ResponsePlan {
  steps: ResponseStep[];
  totalSteps: number;
  currentStep: number;
  requiresUserInput: boolean[];
}

export interface ResponseStep {
  stepId: string;
  content: string;
  order: number;
  dependsOn: string[];
  estimatedLength: number;
}

export class ResponsePlanner {
  public planMultiStepResponse(
    goal: string,
    complexity: number,
    context: Record<string, unknown>
  ): ResponsePlan {
    const stepCount = this.determineStepCount(complexity);
    const steps = this.decompose(goal, stepCount, context);

    return {
      steps,
      totalSteps: steps.length,
      currentStep: 0,
      requiresUserInput: steps.map(() => false),
    };
  }

  private determineStepCount(complexity: number): number {
    if (complexity > 0.8) return 5;
    if (complexity > 0.6) return 3;
    if (complexity > 0.4) return 2;
    return 1;
  }

  private decompose(goal: string, stepCount: number, context: Record<string, unknown>): ResponseStep[] {
    const steps: ResponseStep[] = [];

    for (let i = 0; i < stepCount; i++) {
      steps.push({
        stepId: `step_${i}`,
        content: this.generateStepContent(i, stepCount, goal),
        order: i,
        dependsOn: i > 0 ? [`step_${i - 1}`] : [],
        estimatedLength: 50,
      });
    }

    return steps;
  }

  private generateStepContent(step: number, total: number, goal: string): string {
    if (step === 0) return `Let me help you with ${goal}. First, `;
    if (step === total - 1) return `Finally, `;
    return `Next, `;
  }

  public getNextStep(plan: ResponsePlan): ResponseStep | null {
    if (plan.currentStep >= plan.totalSteps) return null;
    return plan.steps[plan.currentStep];
  }

  public advanceStep(plan: ResponsePlan): void {
    plan.currentStep++;
  }
}
