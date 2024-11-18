using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

public class MongoFilialeTests
{
    private readonly string mongoFilialeSchema = @"{
      ""$schema"": ""http://json-schema.org/draft-07/schema#"",
      ""title"": ""MongoFiliale"",
      ""type"": ""object"",
      ""properties"": {
        ""id"": { ""type"": ""string"" },
        ""name"": { ""type"": ""string"" },
        ""adresse"": { ""type"": ""string"" },
        ""tiere"": {
          ""type"": ""array"",
          ""items"": {
            ""type"": ""object"",
            ""properties"": {
              ""name"": { ""type"": ""string"" },
              ""groesse"": { ""type"": ""number"" },
              ""gewicht"": { ""type"": ""number"" },
              ""anzahl"": { ""type"": ""integer"" }
            },
            ""required"": [""name"", ""groesse"", ""gewicht"", ""anzahl""]
          }
        }
      },
      ""required"": [""id"", ""name"", ""adresse"", ""tiere""]
    }";

    [Fact]
    public void MongoFiliale_ValidObject_ShouldPassSchemaValidation()
    {
        // Arrange
        var mongoTier = new MongoTier
        {
            Name = "Lion",
            Groesse = 2.5m,
            Gewicht = 190.5m,
            Anzahl = 3
        };

        var mongoFiliale = new MongoFiliale
        {
            Id = "60d5ec4b84c1a11d4f94e63d",
            Name = "Zoo Berlin",
            Adresse = "Berlin, Germany",
            Tiere = new List<MongoTier> { mongoTier }
        };

        var json = JsonConvert.SerializeObject(mongoFiliale);

        var schema = JSchema.Parse(mongoFilialeSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void MongoFiliale_MissingRequiredProperty_ShouldFailSchemaValidation()
    {
        // Arrange
        var json = @"{
            ""id"": ""60d5ec4b84c1a11d4f94e63d"",
            ""adresse"": ""Berlin, Germany"",
            ""tiere"": []
        }";

        var schema = JSchema.Parse(mongoFilialeSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Required properties are missing from object: name."));
    }

    [Fact]
    public void MongoFiliale_InvalidDataType_ShouldFailSchemaValidation()
    {
        // Arrange
        var json = @"{
            ""id"": 12345,
            ""name"": ""Zoo Berlin"",
            ""adresse"": ""Berlin, Germany"",
            ""tiere"": []
        }";

        var schema = JSchema.Parse(mongoFilialeSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Invalid type. Expected String but got Integer. Path 'id'"));
    }

    [Fact]
    public void MongoFiliale_InvalidNestedObject_ShouldFailSchemaValidation()
    {
        // Arrange
        var json = @"{
            ""id"": ""60d5ec4b84c1a11d4f94e63d"",
            ""name"": ""Zoo Berlin"",
            ""adresse"": ""Berlin, Germany"",
            ""tiere"": [
                {
                    ""name"": ""Lion"",
                    ""groesse"": 2.5,
                    ""gewicht"": 190.5
                }
            ]
        }";

        var schema = JSchema.Parse(mongoFilialeSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Required properties are missing from object: anzahl."));
    }
}