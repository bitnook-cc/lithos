# Milestone 2 — economy and inheritance

Research income and one-off knowledge rewards now feed one bounded research reserve (24 Stone, 40 Bronze, 60 Classical). Collections invest reserve plus current income into the active project; unused income remains in reserve up to that limit. Every project requires two actual collection ticks, even if its knowledge requirement is already funded. Switching projects preserves both investment and completed ticks. Extra science funds broader research and later projects rather than bypassing the duration floor.

Discovery IDs and unlocked construction methods persist independently of the current age's tree. Saves from Milestone 1 migrate in place with their original backup retained; surviving chronicle entries recover historical discoveries where possible. Missing historical data is not invented. Existing stored knowledge is capped during migration. Old in-progress projects with nonzero progress receive one credited collection tick.

Age inheritance deliberately preserves settled districts and their production instead of collapsing them into a single capital. The capital is rebuilt for the new era; the world grows around the old geographical core. This avoids destroying a healthy food economy at transition. New rival homes are outside owned territory. A structured inheritance summary records retained districts, buildings, discoveries and food production for the UI.

Worker priority is a one-AP district action. The capital remains staffed first, then prioritized districts, then the previous developed/nearby ordering. Population loss still keeps territory; priority lets a player recover food production when only some districts can be staffed.

Climate contrast now survives smoothing. Each normal map offers a nearby food option, a coast and mountains, while specialty terrain and resource deposits remain seed-dependent. Regression coverage samples 50 seeds and tests both transitions, baseline/science-heavy research, project switching, the duration floor, starvation forecasts and worker recovery. UI presentation of these systems accompanies the Stone Age vertical-slice revision.
