# Node Procore 
A node.js wrapper for the procore API.

## Installation
```bash
npm install --save procore 
```

## Example
```javascript
import { authenticate, project, inspection, _ } from 'procore';
import { createSection } from 'procore/inspections';

const clientId = process.env.PROCORE_CLIENT_ID;
const clientSecret = process.env.PROCORE_CLIENT_SECRET;

authenticate({ clientId, clientSecret })
  .then(project({ id: 123 }))
  .then(inspection({ id: 416 }))
  .then(createSection({ name: "Section A", position: 2 }))
  .then(onSuccess)
  .catch(onError);

or 

authenticate({ clientId, clientSecret })
  .then(({ token }) => createSection(
    _,
    { token, name: "Section A", position: 2, projectId: 123, inspectionId: 416 }
  ))
.then(onSuccess)
.catch(onError);
```
