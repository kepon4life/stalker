class RenameDreamsCategoriesToCategoriesDreams < ActiveRecord::Migration
  def self.up
        rename_table :dreams_categories, :categories_dreams
    end 
    def self.down
        rename_table :categories_dreams, :dreams_categories
    end
end
