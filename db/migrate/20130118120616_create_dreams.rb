class CreateDreams < ActiveRecord::Migration
  def change
    create_table :dreams do |t|
      t.boolean :is_valid
      t.binary :metadatas
      t.boolean :secret_room
      t.string :token
      t.timestamps
    end
  end
end
