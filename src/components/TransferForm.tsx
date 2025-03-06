import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  useConnection,
  useUnifiedWallet,
  useUnifiedWalletContext,
} from "@jup-ag/wallet-adapter";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  confirmTransaction,
  getExplorerLink,
} from "@solana-developers/helpers";
import { PYUSD_MINT } from "@/constants";
import { toast } from "sonner";
import TransactionToast from "./TransactionToast";

export default function TransferForm({
  label,
  submitText,
  maxAmount,
  ata,
}: {
  label: string;
  submitText: string;
  maxAmount: number;
  ata: PublicKey;
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const formSchema = z.object({
    amount: z.number().positive().max(maxAmount),
    address: z.string().nonempty({ message: "Receiver address required." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      address: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey) {
      setShowModal(true);
      return;
    } else {
      const destinationAta = getAssociatedTokenAddressSync(
        PYUSD_MINT.address,
        new PublicKey(values.address),
        false,
        PYUSD_MINT.owner,
      );

      const ix = createTransferCheckedInstruction(
        ata,
        PYUSD_MINT.address,
        destinationAta,
        publicKey,
        values.amount * 10 ** PYUSD_MINT.decimals,
        PYUSD_MINT.decimals,
        [],
        PYUSD_MINT.owner,
      );

      try {
        const signature = await sendTransaction(
          new Transaction().add(ix),
          connection,
        );
        await confirmTransaction(connection, signature);

        toast.success(
          <TransactionToast
            title="Transfer sent!"
            link={getExplorerLink("tx", signature, "devnet")}
          />,
        );
      } catch (err) {
        console.error(err);

        const { message } = err as Error;
        toast.error(message);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 items-start"
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="font-semibold">{label}</FormLabel>
                <div className="flex items-center gap-2">
                  <p className="text-xs">Max: {maxAmount}</p>
                  <img src="pyusd.svg" className="size-5" />
                </div>
              </div>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="w-[300px]"
                  min={0}
                  max={maxAmount}
                  step={1 / 10 ** PYUSD_MINT.decimals}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Address" className="w-[300px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="hover:cursor-pointer"
        >
          {form.formState.isSubmitting ? "Transferring..." : submitText}
        </Button>
      </form>
    </Form>
  );
}
