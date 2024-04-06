import { writeFile } from "fs/promises";
import { GameXpInfo } from "../src/games/info";
import { Game } from "../src/games/data";
import { getGameMetainfo } from "../src/index";

(async () => {
	// Ensure order consistency between runs
	const xpInfo: Partial<typeof GameXpInfo> = Object.values(Game).reduce(
		(xpInfo, game) => {
			return { ...xpInfo, [game]: {} };
		},
		{}
	);

	await Promise.all(
		Object.values(Game).map(async game => {
			// The `/game/meta/ground` endpoint returns an error
			if (game === Game.GroundWars) {
				xpInfo[game] = {
					increment: 150,
					max: 20
				};
				return;
			}

			const metaInfo = await getGameMetainfo(game);

            // The Bridge has its own level XP scaling.
			const increment =
				game === Game.Bridge
					? 0
					: parseInt(Object.keys(metaInfo.experienceToLevel)[1]);
			const maxLevel = Object.keys(metaInfo.experienceToLevel).length;

			let incrementCap;
			if (game !== Game.Bridge) {
				let previousDiff = increment;

				for (let level = 2; level < maxLevel; level++) {
					const diff =
						parseInt(Object.keys(metaInfo.experienceToLevel)[level]) -
						parseInt(Object.keys(metaInfo.experienceToLevel)[level - 1]);
					if (diff === previousDiff) {
						incrementCap = level;
						break;
					}
					previousDiff = diff;
				}
			}

			xpInfo[game] = {
				increment: increment,
				increment_cap: incrementCap,
				max: maxLevel,
				max_prestige: metaInfo.allowPrestiging
					? metaInfo.maxPrestige
					: undefined
			};
		})
	);

	await writeFile(
		"src/games/xp_info.json",
		JSON.stringify(xpInfo, undefined, "\t"),
		"utf-8"
	);
})();

