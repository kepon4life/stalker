class DropCategoriesEvents < ActiveRecord::Migration
  def up
    drop_table :categories_events
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
