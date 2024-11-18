using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DBI_Project_2024_25.Models.MongoModels;

public class MongoFiliale
{
    public MongoFiliale() { }

    public MongoFiliale(string id, string name, string adresse)
    {
        Id = id;
        Name = name;
        Adresse = adresse;
    }

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    [BsonElement("name")] public string Name { get; set; } = default!;
    [BsonElement("addresse")] public string Adresse { get; set; } = default!;
    [BsonElement("tiere")] public ICollection<MongoTier> Tiere { get; set; } = new List<MongoTier>();
}