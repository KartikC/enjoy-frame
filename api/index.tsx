import { Button, Frog } from 'frog';
import { handle } from 'frog/vercel';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const fontUrl = './public/arial-narrow.ttf';


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
});

// export const app = new Frog({
//   assetsPath: '/',
//   basePath: '/api',
//   imageOptions: {
//     height: 500,
//     width: 955,
//     fonts: [
//       {
//         name: 'Arial Narrow',
//         data: fs.readFileSync(fontUrl),
//         weight: 400,
//         style: 'normal',
//       },
//     ],
//   },
// });

async function findAddressByFid(fid: string | undefined) {
  // Make a request to the API
  const response = await fetch(
   `https://searchcaster.xyz/api/profiles?fid=${fid}`
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
  console.log(`fid:${fid} > addr:${connectedAddress}`)
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
          src="https://enjoy-frame.vercel.app/begin.png"
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

  const numOrbs = enjoyAmount.toString().split('.')[0].length;
  const orbsArray = Array(numOrbs).fill(0);


  return c.res({
    image: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        color: 'blue',
        fontSize: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '64px',
          color: 'black',
          textAlign: 'center'
        }}>
          <>
            You have
            <br />
            {enjoyAmount < 1 ? (
              <span style={{ color: '#5ac4fa' }}>NO :(</span>
            ) : (
              <span style={{ color: '#5ac4fa' }}>{Math.ceil(enjoyAmount).toLocaleString()}</span>
            )}
            <br />
            ENJOY!!!
          </>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
        {orbsArray.map((_, index) => (
          <img
            key={index}
            src="https://enjoy-frame.vercel.app/enjoy-orb.png"
            alt="Enjoy Orb"
            style={{ width: '50px', height: '50px', margin: '0 5px' }}
          />
        ))}
      </div>
    </div>
    ),
    intents: [
      <Button.Redirect location="https://swap.zora.energy/#/swap/0xa6B280B42CB0b7c4a4F789eC6cCC3a7609A1Bc39">Enjoy more!!!</Button.Redirect>,
    ]
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