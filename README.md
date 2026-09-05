# Hive Tools Wrapper

Type-safe wrapper for the Hive Bedrock API

## Examples

### Fetching Current Monthly Leaderboard

```ts
import { Game, getMonthlyLeaderboard } from "hive-tools-wrapper";

const leaderboard = await getMonthlyLeaderboard(Game.TreasureWars);
```

### Fetching Previous Monthly Leaderboard

```ts
import { Game, getMonthlyLeaderboard } from "hive-tools-wrapper";

const leaderboard = await getMonthlyLeaderboard(Game.TreasureWars, 2022, 8);
```

### Fetching All-Time Leaderboard

```ts
import { Game, getAllTimeLeaderboard } from "hive-tools-wrapper";

const leaderboard = await getAllTimeLeaderboard(Game.TreasureWars);
```

### Fetching Current Monthly Player Stats

```ts
import { Game, getMonthlyStats } from "hive-tools-wrapper";

const stats = await getMonthlyStats("NeutronicMC", Game.TreasureWars);
```

### Fetching Previous Monthly Player Stats

```ts
import { Game, getMonthlyStats } from "hive-tools-wrapper";

const stats = await getMonthlyStats("NeutronicMC", Game.TreasureWars, 2022, 8);
```

### Fetching All-Time Player Stats

```ts
import { Game, getAllTimeStats } from "hive-tools-wrapper";

const stats = await getAllTimeStats("NeutronicMC", Game.TreasureWars);
```

