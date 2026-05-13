import type { WheelReward } from "@/lib/types";

type WeightedReward = {
  reward: WheelReward;
  label: string;
  weight: number;
};

export const rewardConfig: WeightedReward[] = [
  { reward: "free_sticker", label: "Free sticker", weight: 30 },
  { reward: "mini_gift", label: "Mini gift", weight: 12 },
  { reward: "discount_10", label: "10% discount", weight: 18 },
  { reward: "free_shipping", label: "Free shipping", weight: 15 },
  { reward: "no_reward", label: "Try again next box", weight: 25 }
];

export function rewardLabel(reward: WheelReward | null) {
  return rewardConfig.find((item) => item.reward === reward)?.label ?? null;
}

export function pickWeightedReward(random = Math.random()): WheelReward {
  const totalWeight = rewardConfig.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random * totalWeight;

  for (const item of rewardConfig) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.reward;
    }
  }

  return rewardConfig[rewardConfig.length - 1].reward;
}
