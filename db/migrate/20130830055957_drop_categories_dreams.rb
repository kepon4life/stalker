class DropCategoriesDreams < ActiveRecord::Migration
  def up
    drop_table :categories_dreams
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
