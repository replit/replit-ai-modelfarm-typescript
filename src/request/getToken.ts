import { exec } from 'child_process';

const isDeployment = Boolean(process.env.REPLIT_DEPLOYMENT);

async function genReplIdentityToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(
      '$REPLIT_CLI identity create -audience="modelfarm@replit.com"',
      (error, stdout, stderr) => {
        if (error) {
          reject(`Getting identity token: ${error.name} ${error.message}`);
          return;
        }

        if (stderr) {
          reject(`Saw stderr getting identity token: ${stderr}`);
          return;
        }

        resolve(stdout.trim());
      },
    );
  });
}

async function getDeploymentToken(): Promise<string> {
  const res = await fetch('http://localhost:1105/getIdentityToken', {
    body: JSON.stringify({ audience: 'modelfarm@replit.com' }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const json = (await res.json()) as unknown;

  if (!json) {
    throw new Error('Expected json to have identity token');
  }

  if (typeof json !== 'object') {
    throw new Error('Expected json to be an object');
  }

  if (!('identityToken' in json)) {
    throw new Error('Expected json to have identity token');
  }

  if (typeof json.identityToken !== 'string') {
    throw new Error('Expected identity token to be a string');
  }

  return json.identityToken;
}

let cachedToken: string | null = null;

function resetTokenSoon() {
  setTimeout(() => {
    cachedToken = null;
  }, 1000 * 30);
}

export default async function getToken() {
  if (!cachedToken) {
    const fn = isDeployment ? getDeploymentToken : genReplIdentityToken;
    cachedToken = await fn();
    resetTokenSoon();
  }

  return cachedToken;
}
