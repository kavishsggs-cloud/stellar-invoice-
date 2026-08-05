#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AmountMustBePositive = 1,
    InvoiceNotFound = 2,
    InvoiceNotPending = 3,
    Overflow = 4,
}

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
    ) -> Result<u64, ContractError> {
        creator.require_auth();

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        let current_count: u64 = env.storage().instance().get(&INVOICE_COUNT).unwrap_or(0);
        let count = match current_count.checked_add(1) {
            Some(val) => val,
            None => return Err(ContractError::Overflow),
        };

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

        Ok(count)
    }

    pub fn get_invoice(env: Env, id: u64) -> Result<Invoice, ContractError> {
        match env.storage().persistent().get(&id) {
            Some(inv) => Ok(inv),
            None => Err(ContractError::InvoiceNotFound),
        }
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
    ) -> Result<(), ContractError> {
        let mut invoice: Invoice = match env.storage().persistent().get(&id) {
            Some(inv) => inv,
            None => return Err(ContractError::InvoiceNotFound),
        };
        invoice.creator.require_auth();

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }
        
        if invoice.status != InvoiceStatus::Pending {
            return Err(ContractError::InvoiceNotPending);
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
        Ok(())
    }

    pub fn mark_paid(env: Env, id: u64, tx_hash: String) -> Result<(), ContractError> {
        let mut invoice: Invoice = match env.storage().persistent().get(&id) {
            Some(inv) => inv,
            None => return Err(ContractError::InvoiceNotFound),
        };
        if invoice.status != InvoiceStatus::Pending {
            return Err(ContractError::InvoiceNotPending);
        }
        invoice.status = InvoiceStatus::Paid;
        invoice.tx_hash = tx_hash;
        invoice.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&id, &invoice);
        env.events().publish((symbol_short!("Invoice"), symbol_short!("Paid"), id), invoice);
        Ok(())
    }

    pub fn cancel_invoice(env: Env, id: u64) -> Result<(), ContractError> {
        let mut invoice: Invoice = match env.storage().persistent().get(&id) {
            Some(inv) => inv,
            None => return Err(ContractError::InvoiceNotFound),
        };
        invoice.creator.require_auth();
        if invoice.status != InvoiceStatus::Pending {
            return Err(ContractError::InvoiceNotPending);
        }
        invoice.status = InvoiceStatus::Cancelled;
        invoice.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&id, &invoice);
        env.events().publish((symbol_short!("Invoice"), symbol_short!("Cancelled"), id), invoice);
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_create_and_get_invoice() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, InvoiceContract);
        let client = InvoiceContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let recipient = Address::generate(&env);
        let asset = Address::generate(&env);

        let invoice_id = client.create_invoice(
            &creator,
            &String::from_str(&env, "Acme Corp"),
            &recipient,
            &String::from_str(&env, "billing@acme.com"),
            &String::from_str(&env, "Web3 Consulting Services"),
            &5000000000i128,
            &asset,
            &String::from_str(&env, "INV-001"),
            &String::from_str(&env, "Net 30 terms"),
            &1750000000u64,
        );

        assert_eq!(invoice_id, 1);

        let inv = client.get_invoice(&1);
        assert_eq!(inv.amount, 5000000000i128);
        assert_eq!(inv.status, InvoiceStatus::Pending);
    }

    #[test]
    fn test_create_invoice_negative_amount_error() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, InvoiceContract);
        let client = InvoiceContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let recipient = Address::generate(&env);
        let asset = Address::generate(&env);

        let res = client.try_create_invoice(
            &creator,
            &String::from_str(&env, "Acme Corp"),
            &recipient,
            &String::from_str(&env, "billing@acme.com"),
            &String::from_str(&env, "Invalid Invoice"),
            &-100i128,
            &asset,
            &String::from_str(&env, "INV-002"),
            &String::from_str(&env, ""),
            &1750000000u64,
        );

        assert_eq!(res, Err(Ok(ContractError::AmountMustBePositive)));
    }

    #[test]
    fn test_mark_paid() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, InvoiceContract);
        let client = InvoiceContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let recipient = Address::generate(&env);
        let asset = Address::generate(&env);

        let invoice_id = client.create_invoice(
            &creator,
            &String::from_str(&env, "Acme Corp"),
            &recipient,
            &String::from_str(&env, "billing@acme.com"),
            &String::from_str(&env, "Services"),
            &1000000i128,
            &asset,
            &String::from_str(&env, "INV-003"),
            &String::from_str(&env, ""),
            &1750000000u64,
        );

        client.mark_paid(&invoice_id, &String::from_str(&env, "tx_hash_12345"));
        let inv = client.get_invoice(&invoice_id);
        assert_eq!(inv.status, InvoiceStatus::Paid);
        assert_eq!(inv.tx_hash, String::from_str(&env, "tx_hash_12345"));
    }
}




