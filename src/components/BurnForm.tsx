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
import { createBurnCheckedInstruction } from "@solana/spl-token";
import { PYUSD_MINT } from "@/constants";
import { PublicKey, Transaction } from "@solana/web3.js";
import { toast } from "sonner";
import TransactionToast from "./TransactionToast";
import {
  confirmTransaction,
  getExplorerLink,
} from "@solana-developers/helpers";

export default function BurnForm({
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
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey) {
      setShowModal(true);
      return;
    } else {
      const ix = createBurnCheckedInstruction(
        ata,
        PYUSD_MINT.address,
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
            title="Tokens burned!"
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
              <FormLabel className="font-semibold">{label}</FormLabel>
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
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="hover:cursor-pointer"
        >
          {form.formState.isSubmitting ? "Burning..." : submitText}
        </Button>
      </form>
    </Form>
  );
}
