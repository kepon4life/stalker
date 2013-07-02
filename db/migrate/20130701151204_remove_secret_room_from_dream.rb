class RemoveSecretRoomFromDream < ActiveRecord::Migration
  def up
    remove_column :dreams, :secret_room
  end

  def down
    add_column :dreams, :secret_room, :boolean
  end
end
