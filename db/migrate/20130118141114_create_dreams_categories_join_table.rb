class CreateDreamsCategoriesJoinTable < ActiveRecord::Migration
   def self.up
    create_table :dreams_categories, :id => false do |t|
      t.references :dream, :category # Pour créer les clés etrangères
    end
    add_index :dreams_categories, [:dream_id, :category_id] # Optionnel
  end
  def self.down
    drop_table :dreams_categories
  end
end
