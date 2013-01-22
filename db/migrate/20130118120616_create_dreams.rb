class CreateDreams < ActiveRecord::Migration
  def change
    create_table :dreams do |t|
      t.string :file_name
      t.boolean :is_valid
      t.integer :category_id

      t.timestamps
    end
  end
end
