#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    Paid,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Invoice {
    pub id: u64,
    pub creator: Address,
    pub client_name: String,
    pub recipient: Address,
    pub client_email: String,
    pub description: String,
    pub amount: i128,
    pub asset: Address,
    pub memo: String,
    pub notes: String,
    pub due_date: u64,
    pub status: InvoiceStatus,
    pub tx_hash: String,
    pub created_at: u64,
    pub updated_at: u64,
}

const INVOICE_COUNT: Symbol = symbol_short!("INV_CNT");

#[contract]
pub struct InvoiceContract;

#[contractimpl]
impl InvoiceContract {
    pub fn create_invoice(
        env: Env,
        creator: Address,
        client_name: String,
        recipient: Address,
        client_email: String,
        description: String,
        amount: i128,
        asset: Address,
        memo: String,
        notes: String,
        due_date: u64,
    ) -> u64 {
        creator.require_auth();

        let mut count: u64 = env.storage().instance().get(&INVOICE_COUNT).unwrap_or(0);
        count += 1;

        let now = env.ledger().timestamp();
        let invoice = Invoice {
            id: count,
            creator: creator.clone(),
            client_name,
            recipient,
            client_email,
            description,
            amount,
            asset,
            memo,
            notes,
            due_date,
            status: InvoiceStatus::Pending,
            tx_hash: String::from_str(&env, ""),
            created_at: now,
            updated_at: now,
        };

        env.storage().persistent().set(&count, &invoice);
        env.storage().instance().set(&INVOICE_COUNT, &count);

        let mut user_invoices: Vec<u64> = env.storage().persistent().get(&creator).unwrap_or(Vec::new(&env));
        user_invoices.push_back(count);
        env.storage().persistent().set(&creator, &user_invoices);

        env.events().publish((symbol_short!("Invoice"), symbol_short!("Created"), count), invoice);

        count
    }

    pub fn get_invoice(env: Env, id: u64) -> Invoice {
        env.storage().persistent().get(&id).unwrap()
    }

    pub fn list_invoices(env: Env, creator: Address) -> Vec<Invoice> {
        let user_invoices: Vec<u64> = env.storage().persistent().get(&creator).unwrap_or(Vec::new(&env));
        let mut invoices = Vec::new(&env);
        for id in user_invoices.iter() {
            if let Some(inv) = env.storage().persistent().get::<_, Invoice>(&id) {
                invoices.push_back(inv);
            }
        }
        invoices
    }

    pub fn update_invoice(
        env: Env,
        id: u64,
        client_name: String,
        recipient: Address,
        client_email: String,
        description: String,
        amount: i128,
        asset: Address,
        memo: String,
        notes: String,
        due_date: u64,
    ) {
        let mut invoice: Invoice = env.storage().persistent().get(&id).unwrap();
        invoice.creator.require_auth();
        
        if invoice.status != InvoiceStatus::Pending {
            panic!("Cannot update non-pending invoice");
        }

        invoice.client_name = client_name;
        invoice.recipient = recipient;
        invoice.client_email = client_email;
        invoice.description = description;
        invoice.amount = amount;
        invoice.asset = asset;
        invoice.memo = memo;
        invoice.notes = notes;
        invoice.due_date = due_date;
        invoice.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&id, &invoice);
        env.events().publish((symbol_short!("Invoice"), symbol_short!("Updated"), id), invoice);
    }

    pub fn mark_paid(env: Env, id: u64, tx_hash: String) {
        let mut invoice: Invoice = env.storage().persistent().get(&id).unwrap();
        invoice.status = InvoiceStatus::Paid;
        invoice.tx_hash = tx_hash;
        invoice.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&id, &invoice);
        env.events().publish((symbol_short!("Invoice"), symbol_short!("Paid"), id), invoice);
    }

    pub fn cancel_invoice(env: Env, id: u64) {
        let mut invoice: Invoice = env.storage().persistent().get(&id).unwrap();
        invoice.creator.require_auth();
        invoice.status = InvoiceStatus::Cancelled;
        invoice.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&id, &invoice);
        env.events().publish((symbol_short!("Invoice"), symbol_short!("Cancelled"), id), invoice);
    }
}
