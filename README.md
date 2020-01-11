

## Payspec Bot

This bot will have an internal mongo database with
  1) Pre-Invoices  (perpared invoices, not yet committed to the blockchain )
  2) A list of deployed invoices by UUID


Will serve an express website with:

1) A customer-facing portal with
  * a 'show invoices' page that serves the invoice data from the mongo database
  (static page, uses metamask)

2) An admin backend (requires console-generated password)  with
  * a list of all invoices cached from mongo, searchable


3) a local API
  * can generate and store a pre-invoice and provide the 'show invoice' page URL
  * can retrieve data from the ethereum blockchain related to the invoices state on-chain
https://www.engineyard.com/blog/rails-and-vue-js-part-1



### Set up

#### postgres
> sudo -i -u postgres;
> psql
> create role payspec with createdb login password 'password';
> CREATE DATABASE payspec_development OWNER payspec;


##### webpack
RAILS_ENV=development  ./bin/rails webpacker:compile


#### Running the site
rails s
