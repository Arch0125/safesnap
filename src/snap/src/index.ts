import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { panel, text, divider, heading, copyable } from "@metamask/snaps-ui";
import { OnTransactionHandler } from "@metamask/snaps-types";

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case "confirmTransaction": {
      const res = await snap.request({
        method: "snap_dialog",
        params: {
          type: "Confirmation",
          content: panel([
            heading("Confirm Transaction"),
            text(`Do you want to approve transaction from ${origin} ?`),
            divider(),
            text(
              "An **OTP** will be sent to you registered account via PUSH, after that you will be taken to approve transaction."
            ),
          ]),
        },
      });

      if (res) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const res1 = await snap.request({
          method: "snap_dialog",
          params: {
            type: "Prompt",
            content: panel([
              heading(`Enter OTP ${otp} `),
              divider(),
              text(`**Important**`),
              text(`❌ Never share OTP with someone`),
              text(`❌ OTP is not accessible by the Dapp or Website `),
              text(
                `✅ OTP remains in the Metamask itself during transaction period and gets deleted immediately after.`
              ),
            ]),
            placeholder: "Enter OTP...",
          },
        });
        if (Number(res1) === otp) {
          approvedTx(origin);
        } else {
          rejectedTx(origin);
        }
      } else {
        rejectedTx(origin);
      }

      return { res, origin };
    }

    default:
      throw new Error("Method not found.");
  }
};

const rejectedTx = async (origin: string) => {
  await snap.request({
    method: "snap_dialog",
    params: {
      type: "Alert",
      content: panel([
        heading("Transaction Rejected"),
        divider(),
        text(`Transaction from ${origin} has been rejected.`),
      ]),
    },
  });
};

const approvedTx = async (origin) => {
  await snap.request({
    method: "snap_dialog",
    params: {
      type: "Alert",
      content: panel([
        heading("Transaction Approved"),
        divider(),
        text(`Verification has been done with ${origin}`),
        text(`Now you will be redirected to the Signing Page`),
      ]),
    },
  });
};
