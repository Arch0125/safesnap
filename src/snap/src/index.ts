import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text,divider,heading, copyable } from '@metamask/snaps-ui';
import { OnTransactionHandler } from '@metamask/snaps-types';


async function simul(from:string, to:string, value:string, data:string){
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      "id": 1,
      "jsonrpc": "2.0",
      "method": "alchemy_simulateAssetChanges",
      "params": [
           {
                "from": `${from}`,
                "to": `${to}`,
                "value": `${value}`,
                "data": `${data}`
           }
      ]
 }
 )
  };
  
  const res = await fetch('https://eth-goerli.g.alchemy.com/v2/gh4d1-dAT4B_1Khy86s7JUbFhQIclYqO', options)
  return res;
}
async function generateResult(tokens: any){
  let result = ``
  let tokenres: string[]=[]
  tokens = JSON.parse(tokens);
  tokens.forEach((token: any) => {
    result = `\n🔵 ${Number(token.amount).toFixed(2)} ${token.symbol} ${token.changeType} from ${token.from.toString().slice(0,5)} to ${token.to.toString().slice(0,5)}\n`;
    tokenres.push(result)
  });
  return tokenres;
}
export const onTransaction: OnTransactionHandler = ({ transactionOrigin, transaction }) => {
  const{from, to, value, data} = transaction;
  return simul(from,to,value,data).then(async (txdetails) => {
    const res = await txdetails.json();
    const tokens = JSON.stringify(res.result.changes);
    const error = JSON.stringify(res.result.error);
    if(error === "null"){
      let tokenchange = await generateResult(tokens);
      const insights =tokenchange
      const content = panel([
        heading('Alert heading'),
        text('Something happened in the system.'),
      ]);
      return {
        content: panel([
          heading('My Transaction Insights'),
          text(`Transaction Details : ${transactionOrigin}`),
          text('Asset Changes :'),
          ...(insights.map((insight) => text(insight))),
        ])
      };
    }else{
      return {
        insights:{
          message: 
            `API Limit reached, please try again later`,
        }
      }
    }  
  });
};

export const onRpcRequest: OnRpcRequestHandler = async({ origin, request }) => {
  switch (request.method) {
      
    case 'confirmTransaction':{
      const res = await snap.request({
        method: 'snap_dialog',
        params: {
        type: 'Confirmation',
          content: panel([heading('Confirm Transaction'), text(`Do you want to approve transaction from ${origin} ?`),divider(),text('An **OTP** will be sent to you registered account via PUSH, after that you will be taken to approve transaction.')]),
        },
      });
      return {res,origin};
    }

    case 'requestOtp':{
      const number = Math.floor(Math.random()*(999-100+1)+100);
      const res = await enterotp();
      return res;
    }

    case 'wrongOtp':{
      const response = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Alert',
          content: panel([heading('Wrong OTP'), text('A notification has been sent to the wallet owner')]),
        },
      });
      return response;
    }

    default:
      throw new Error('Method not found.');
  }
};


async function promptUser(title: any, message: any) {
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'Confirmation',
      content: panel([heading(title), text(message)]),
    },
  });
  return response;
}

async function enterotp() {
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'Prompt',
      content: panel([heading('Enter OTP'), copyable('Enter OTP')]),
      placeholder: 'Enter OTP...',
    },
  });
  return response;
}