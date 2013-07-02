class RemoveFileNameFromDream < ActiveRecord::Migration
  def up
    remove_column :dreams, :file_name
  end

  def down
    add_column :dreams, :file_name, :string
  end
end
