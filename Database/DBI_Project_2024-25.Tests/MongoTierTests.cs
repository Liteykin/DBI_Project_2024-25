using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

public class MongoTierTests
{
    private readonly string mongoTierSchema = @"{
      ""$schema"": ""http://json-schema.org/draft-07/schema#"",
      ""title"": ""MongoTier"",
      ""type"": ""object"",
      ""properties"": {
        ""name"": { ""type"": ""string"" },
        ""groesse"": { ""type"": ""number"" },
        ""gewicht"": { ""type"": ""number"" },
        ""anzahl"": { ""type"": ""integer"" }
      },
      ""required"": [""name"", ""groesse"", ""gewicht"", ""anzahl""]
    }";

    [Fact]
    public void MongoTier_ValidObject_ShouldPassSchemaValidation()
    {
        // Arrange
        var mongoTier = new MongoTier
        {
            Name = "Lion",
            Groesse = 2.5m,
            Gewicht = 190.5m,
            Anzahl = 3
        };

        var json = JsonConvert.SerializeObject(mongoTier);

        var schema = JSchema.Parse(mongoTierSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.True(isValid);
        Assert.Empty(errors);
    }

    [Fact]
    public void MongoTier_MissingRequiredProperty_ShouldFailSchemaValidation()
    {
        // Arrange
        var json = @"{
            ""groesse"": 2.5,
            ""gewicht"": 190.5,
            ""anzahl"": 3
        }";

        var schema = JSchema.Parse(mongoTierSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Required properties are missing from object: name."));
    }

    [Fact]
    public void MongoTier_InvalidDataType_ShouldFailSchemaValidation()
    {
        // Arrange
        var json = @"{
            ""name"": ""Lion"",
            ""groesse"": ""invalid_number"",
            ""gewicht"": 190.5,
            ""anzahl"": 3
        }";

        var schema = JSchema.Parse(mongoTierSchema);

        // Act
        var isValid = JObject.Parse(json).IsValid(schema, out IList<string> errors);

        // Assert
        Assert.False(isValid);
        Assert.Contains(errors, e => e.Contains("Invalid type. Expected Number but got String. Path 'groesse'"));
    }
}