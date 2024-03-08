import { Button, Frog } from 'frog';
import { handle } from 'frog/vercel';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
});

async function findAddressByFid(fid: string | undefined) {
  // Make a request to the API
  const response = await fetch(
   // `https://searchcaster.xyz/api/profiles?fid=${fid}`
    `https://searchcaster.xyz/api/profiles?fid=639`
  );
  const data = await response.json();
  // Store the connectedAddress
  let connectedAddress = null;
  try {
    connectedAddress = data[0].connectedAddress;
  } catch (error) {
    console.error(error);
    return;
  }
  return connectedAddress;
}

async function getEnjoyAmount(walletAddress: string): Promise<number> {
  const apiUrl = `https://api.zerion.io/v1/wallets/${walletAddress}/positions/?filter[positions]=only_simple&currency=usd&filter[chain_ids]=zora&filter[fungible_ids]=6a10facc-80b7-4f52-9532-ea589091d03a&filter[trash]=only_non_trash&sort=value`;
  const apiHeaders = {
    accept: 'application/json',
    authorization: process.env.ZERION_AUTH_TOKEN || ''
  };
  //const ArialNarrowFont = '/arial-narrow.ttf';

  try {
    const response = await fetch(apiUrl, { headers: apiHeaders });
    const data = await response.json();
    console.log(data);
    if (data.data && data.data.length > 0) {
      const enjoyPosition = data.data[0];
      const enjoyAmount = parseFloat(enjoyPosition.attributes.quantity.numeric);
      return enjoyAmount;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error fetching Enjoy amount:', error);
    return 0;
  }
}

// Starting frame, FID auto-captured
app.frame('/', (c) => {
  return c.res({
    action: '/check',
    image: (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <img 
          src="https://enjoy-frame.vercel.app/start.png"
          alt="Start"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    ),
    intents: [
      <Button value="check">How much do you enjoy?!!!</Button>,
    ]
  })
})

// Frame to display user's enjoy holdings.
app.frame('/check', async (c) => { 
  const { status, frameData } = c

  let enjoyAmount = 0;
  if (status === 'response') {
    const address = await findAddressByFid(frameData?.fid?.toString());
    if (address) {
      enjoyAmount = await getEnjoyAmount(address);
    }
  }

  return c.res({
    image: (
      <div style={{ 
        backgroundImage: `url(https://enjoy-frame.vercel.app/enjoy.png)`,
        backgroundSize: 'cover',
        display: 'flex',
        color: 'blue',
        backgroundPosition: 'center',
        width: '100%',
        height: '100%'
      }}>
        You have ${enjoyAmount} ENJOY tokens!
      </div>
    )
  })
})

// app.frame('/', async (c) => {
//   const { status, frameData } = c;
//   let enjoyAmount = 0;
//   if (status === 'response') {
//     const address = await findAddressByFid(frameData?.fid?.toString());
//     if (address) {
//       enjoyAmount = await getEnjoyAmount(address);
//     }
//   }
//   return c.res({
//     image: (
//       <div
//         style={{
//           alignItems: 'center',
//           background:
//             status === 'response'
//               ? 'linear-gradient(to right, #432889, #17101F)'
//               : 'black',
//           backgroundSize: '100% 100%',
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           height: '100%',
//           justifyContent: 'center',
//           textAlign: 'center',
//           width: '100%',
//         }}
//       >
//         <div
//           style={{
//             backgroundImage: `url(https://raw.githubusercontent.com/KartikC/enjoy-frame/main/public/start.png?token=GHSAT0AAAAAACLSSL46OPKM6O4CR3ZJ2H3AZPKMYPA)`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             height: '100%',
//             width: '100%',
//             color: 'white',
//             fontSize: 60,
//             fontStyle: 'normal',
//             letterSpacing: '-0.025em',
//             lineHeight: 1.4,
//             marginTop: 30,
//             padding: '0 120px',
//             whiteSpace: 'pre-wrap',
//           }}
//         >
//           {status === 'response'
//             ? `You have ${enjoyAmount} ENJOY tokens!`
//             : 'Welcome!!'}
//         </div>
//       </div>
//     ),
//     intents: [
//       <Button value="check">How much ENJOY?</Button>,
//     ],
//   });
// });

export const GET = handle(app);
export const POST = handle(app);