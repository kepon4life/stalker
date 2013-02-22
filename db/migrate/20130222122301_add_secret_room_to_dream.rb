class AddSecretRoomToDream < ActiveRecord::Migration
  	def self.up
    	add_column :dreams, :secret_room, :boolean, :default => 0
  	end

 	def self.down
   		remove_column :dreams, :secret_room
 	end
end
