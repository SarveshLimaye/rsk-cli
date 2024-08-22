#!/usr/bin/env node

import { Command } from 'commander';
import { createWalletCommand } from '../src/commands/createWallet.js';
import { balanceCommand } from '../src/commands/balance.js';
import { transferCommand } from '../src/commands/transfer.js';
import { txCommand } from '../src/commands/tx.js';
import figlet from 'figlet';
import chalk from 'chalk';

interface CommandOptions {
  testnet?: boolean;
  address?: string;
  value?: string;
  txid?: string;
}

// Define a custom orange color
const orange = chalk.rgb(255, 165, 0);

console.log(
  orange(
    figlet.textSync('Rootstock', {
      font: '3D-ASCII',
      horizontalLayout: 'fitted',
      verticalLayout: 'fitted',
    })
  )
);

// Initialize the program with Commander
const program = new Command();

// Configure the CLI
program
  .name('rsk-cli')
  .description('CLI tool for interacting with Rootstock blockchain')
  .version('1.0.0');

// Add the create wallet command
program
  .command('createWallet')
  .description('Create a new wallet on the selected network')
  .action(async (options: CommandOptions) => {
    await createWalletCommand();
  });

// Add the balance command
program
  .command('balance')
  .description('Check the balance of the saved wallet')
  .option('-t, --testnet', 'Check the balance on the testnet')
  .action(async (options: CommandOptions) => {
    const network = !!options.testnet ? 'testnet' : 'mainnet';
    await balanceCommand(!!options.testnet); // Ensure it's always boolean
  });

// Add the transfer command
program
  .command('transfer')
  .description('Transfer rBTC to the provided address')
  .option('-t, --testnet', 'Transfer on the testnet')
  .requiredOption('-a, --address <address>', 'Recipient address')
  .requiredOption('-v, --value <value>', 'Amount to transfer in rBTC')
  .action(async (options: CommandOptions) => {
    try {
      await transferCommand(!!options.testnet, `0x${options.address!}`, parseFloat(options.value!));
    } catch (error) {
      console.error(chalk.red('Error during transfer:'), error);
    }
  });

// Add the transaction status command
program
  .command('tx')
  .description('Check the status of a transaction')
  .option('-t, --testnet', 'Check the transaction status on the testnet')
  .requiredOption('-i, --txid <txid>', 'Transaction ID')
  .action(async (options: CommandOptions) => {
    // Ensure txid starts with "0x" and cast it to the correct type
    const formattedTxId = options.txid!.startsWith('0x')
      ? options.txid
      : `0x${options.txid}`;
    
    await txCommand(!!options.testnet, formattedTxId as `0x${string}`);
  });

// Parse command-line arguments
program.parse(process.argv);
