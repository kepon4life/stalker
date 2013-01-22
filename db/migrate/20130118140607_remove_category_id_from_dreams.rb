class RemoveCategoryIdFromDreams < ActiveRecord::Migration
  def up
    remove_column :dreams, :category_id
  end

  def down
    add_column :dreams, :category_id, :integer
  end
end
