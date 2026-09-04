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
		Object.values(Game)
			.filter((game, index, games) => games.indexOf(game) === index)
			.map(async game => {
				// SkyWars Classic/Kits share XP with SkyWars and have no meta endpoint.
				if (game === Game.SkyWarsClassic || game === Game.SkyWarsKits) {
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

	xpInfo[Game.SkyWarsClassic] = { ...xpInfo[Game.SkyWars]! };
	xpInfo[Game.SkyWarsKits] = { ...xpInfo[Game.SkyWars]! };

	await writeFile(
		"src/games/xp_info.json",
		JSON.stringify(xpInfo, undefined, "\t"),
		"utf-8"
	);
})();
