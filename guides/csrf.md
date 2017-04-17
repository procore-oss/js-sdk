# Csrf

```javascript
import { client, csrf } from 'procore';

const procore = client(
  csrf(),
  ''
);

procore
  .patch({
    endpoint: `projects/${project_id}/rfis/${id}`,
    payload: { subject: "Updated RFI Subject", assignee_id: 2945 }
  })
  .then(onSuccess);
```
