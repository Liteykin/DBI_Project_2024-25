using System.ComponentModel.DataAnnotations;

namespace DBI_Project_2024_25.Models;

public class Filiale
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Adresse { get; set; } = default!;
    
    public ICollection<TierFiliale> TierFilialen { get; set; } = new List<TierFiliale>();

    public Filiale(int id, string name, string adresse)
    {
        Id = id;
        Name = name;
        Adresse = adresse;
    }
}