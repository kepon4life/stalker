class AddSecretRoomFromDream < ActiveRecord::Migration
  	def self.up
    	add_column :dreams, :secret_room, :boolean
  	end

 	def self.down
   		remove_column :dreams, :secret_room
 	end
end
