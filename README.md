# Genie-AladdinConnect
[![Build and Lint](https://github.com/bloomkd46/Genie-AladdinConnect/actions/workflows/build.yml/badge.svg)](https://github.com/bloomkd46/Genie-AladdinConnect/actions/workflows/build.yml)
[![Typedoc Generator](https://github.com/bloomkd46/Genie-AladdinConnect/actions/workflows/typedoc.yml/badge.svg)](https://github.com/bloomkd46/Genie-AladdinConnect/actions/workflows/typedoc.yml)
```typescript
import Aladdin from 'genie-aladdinconnect'

Aladdin.connect('<username>', '<password>').then(async doors => {
  await doors[0].close()
  process.exit(0);
});

```