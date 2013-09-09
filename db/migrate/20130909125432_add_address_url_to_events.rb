class AddAddressUrlToEvents < ActiveRecord::Migration
  def change
    add_column :events, :address_url, :string
  end
end
