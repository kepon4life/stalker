class AddMetadatasToDream < ActiveRecord::Migration
  def self.up
    	add_column :dreams, :metadatas, :binary
  	end

 	def self.down
   		remove_column :dreams, :metadatas
 	end
end
